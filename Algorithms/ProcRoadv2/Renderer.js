const FLOATS_PER_VERTEX = 2; // solo x, y
const BYTES_PER_VERTEX = FLOATS_PER_VERTEX * 4;
const MAX_VERTICES = 2_500_000 * 2;
const MAX_INDICES = 7_500_000 * 2;

/**
 * NOTAS SOBRE RENDIMIENTO:
 * En Windows Google Chrome va BIEN
 * En MacOS   Google Chrome va MUY MAL
 * En MacOS   Safari va MUY BIEN
 * Supongo que es porque en mac Safari va directo a Metal y Chrome tiene capas de traduccion lentas 
 */

class Renderer{
    constructor(tool) {
        this.tool = tool;
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = this.canvas.getContext('webgl2');
        if(!this.gl) {
            alert('WebGL2 no soportado en este navegador');
            throw new Error('WebGL2 no soportado');
        }
        this.vertexData = new Float32Array(MAX_VERTICES * FLOATS_PER_VERTEX);
        this.indexData  = new Uint32Array(MAX_INDICES);
        this.vertexCursor = 0;
        this.indexCursor  = 0;

        this.programs = new Map()

        // Free-list: huecos disponibles, agrupados por tamaño.
        // Clave: vertexCount, Valor: array de slots libres con ese tamaño.
        this.freeVertexSlots = new Map();
        this.freeIndexSlots  = new Map();

        // Contadores para saber cuánto espacio desperdiciado tenemos
        this.wastedVertices = 0;
        this.wastedIndices  = 0;

        this.initShaders();
        this.initBuffers();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.efficiency = {
            drawCalls: 0,
            meshes: 0,
        };

        
    }


    

    // ---------- Aloc/free de slots ----------

    _allocVertexSlot(vCount) {
        // Busca un hueco del tamaño exacto
        const bucket = this.freeVertexSlots.get(vCount);
        if(bucket && bucket.length > 0) {
            this.wastedVertices -= vCount;
            return bucket.pop();
        }
        // Si no hay hueco, avanza el cursor
        const off = this.vertexCursor;
        if(off + vCount > MAX_VERTICES) {
            // Antes de fallar, intenta compactar (ver más abajo)
            throw new Error('VBO lleno');
        }
        this.vertexCursor += vCount;
        return off;
    }
    _allocIndexSlot(iCount) {
        const bucket = this.freeIndexSlots.get(iCount);
        if(bucket && bucket.length > 0) {
            this.wastedIndices -= iCount;
            return bucket.pop();
        }
        const off = this.indexCursor;
        if(off + iCount > MAX_INDICES) {
            throw new Error('IBO lleno');
        }
        this.indexCursor += iCount;
        return off;
    }
    _freeVertexSlot(off, vCount) {
        let bucket = this.freeVertexSlots.get(vCount);
        if(!bucket) {
            bucket = [];
            this.freeVertexSlots.set(vCount, bucket);
        }
        bucket.push(off);
        this.wastedVertices += vCount;
    }
    _freeIndexSlot(off, iCount) {
        let bucket = this.freeIndexSlots.get(iCount);
        if(!bucket) {
            bucket = [];
            this.freeIndexSlots.set(iCount, bucket);
        }
        bucket.push(off);
        this.wastedIndices += iCount;
    } 

    // ---------- Shaders ----------
    initShaders() {
        let programObjShaderSuperficies = {
            program: null,
            aPos: null,
            uResolution: null,
            uCameraOffset: null,
            uCameraScale: null,
            uColor: null,
        }
        let program = this.gl.createProgram();
        this.gl.attachShader(program, this.compile(this.gl.VERTEX_SHADER, vsSrc));
        this.gl.attachShader(program, this.compile(this.gl.FRAGMENT_SHADER, fsSrc));
        this.gl.linkProgram(program);
        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) throw new Error(this.gl.getProgramInfoLog(program));
        this.gl.useProgram(program);
        programObjShaderSuperficies.aPos = this.gl.getAttribLocation(program, 'aPos');
        programObjShaderSuperficies.uResolution = this.gl.getUniformLocation(program, 'uResolution');
        programObjShaderSuperficies.uCameraOffset = this.gl.getUniformLocation(program, 'uCameraOffset');
        programObjShaderSuperficies.uCameraScale = this.gl.getUniformLocation(program, 'uCameraScale');
        programObjShaderSuperficies.uColor = this.gl.getUniformLocation(program, 'uColor');
        programObjShaderSuperficies.program = program;
        this.programs.set('surfaceShader', programObjShaderSuperficies);
        this._initHoverShader();
    }

    // guardamos los corners en una textura, asi no hay (casi) limite de numero de vertices
    // al draw le pasamos tambien el earcut, asi no hay pixeles pintados fuera del poligono,
    // ya que las intersecciones son concavas
    _initHoverShader() {
        const gl = this.gl;
        const prog = gl.createProgram();
        gl.attachShader(prog, this.compile(gl.VERTEX_SHADER, vsHoverSrc));
        gl.attachShader(prog, this.compile(gl.FRAGMENT_SHADER, fsHoverSrc));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        const obj = {
            program:       prog,
            aPos:          gl.getAttribLocation(prog, 'aPos'),
            uResolution:   gl.getUniformLocation(prog, 'uResolution'),
            uCameraOffset: gl.getUniformLocation(prog, 'uCameraOffset'),
            uCameraScale:  gl.getUniformLocation(prog, 'uCameraScale'),
            uColor:        gl.getUniformLocation(prog, 'uColor'),
            uBorderWidth:  gl.getUniformLocation(prog, 'uBorderWidth'),
            uCorners:      gl.getUniformLocation(prog, 'uCorners'),
            uCornersCount: gl.getUniformLocation(prog, 'uCornerCount')
        };
        this.programs.set('hoverShader', obj);

        // Buffers vacíos - se redimensionan en cada draw con bufferData
        this.hoverVBO = gl.createBuffer();
        this.hoverIBO = gl.createBuffer();

        // Textura 1D-style (N×1) RG32F para los corners
        this.hoverCornersTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.hoverCornersTex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.hoverVAO = gl.createVertexArray();
        gl.bindVertexArray(this.hoverVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.hoverVBO);
        gl.enableVertexAttribArray(obj.aPos);
        gl.vertexAttribPointer(obj.aPos, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.hoverIBO); // queda capturado en el VAO
        gl.bindVertexArray(null);
    }

    compile(type, src) {
        const s = this.gl.createShader(type);
        this.gl.shaderSource(s, src);
        this.gl.compileShader(s);
        if(!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) throw new Error(this.gl.getShaderInfoLog(s));
        return s;
    }

    // ---------- Buffers globales ----------
    initBuffers() {
        const gl = this.gl;
        // Typed arrays en CPU (espejo de lo que hay en GPU, útil para edición)
        this.vertexData = new Float32Array(MAX_VERTICES * FLOATS_PER_VERTEX);
        this.indexData = new Uint32Array(MAX_INDICES);
        this.vertexCursor = 0; // siguiente vértice libre
        this.indexCursor = 0; // siguiente índice libre
        // VBO
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);
        // IBO
        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData.byteLength, gl.DYNAMIC_DRAW);
        // VAO: encapsula la config de atributos. Se bindea una vez al dibujar.
        const aPos = this.programs.get('surfaceShader').aPos;
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, BYTES_PER_VERTEX, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bindVertexArray(null);
    }

    resizeCanvas() {
        const dpr  = window.devicePixelRatio || 1;
        const cssW = window.innerWidth;
        const cssH = window.innerHeight;
        const bufW = Math.round(cssW * dpr);
        const bufH = Math.round(cssH * dpr);
        // CSS size keeps the element at the right layout size.
        this.canvas.style.width  = cssW + 'px';
        this.canvas.style.height = cssH + 'px';
        // Buffer at physical-pixel resolution — eliminates Retina blur.
        // Guard: setting .width/.height resets WebGL state even with same value.
        if(this.canvas.width !== bufW || this.canvas.height !== bufH) {
            this.canvas.width  = bufW;
            this.canvas.height = bufH;
        }
        this.cssWidth  = cssW;
        this.cssHeight = cssH;
        this.gl.viewport(0, 0, bufW, bufH);
    }

    // ---------- API: añadir un polígono ----------
    //
    // points: array de {x, y} con el contorno del polígono.
    // localIndices: índices LOCALES devueltos por earcut (referidos a 0..N-1
    //               dentro de points). Si triangulas fuera, pásalos aquí.
    //
    // Devuelve un "handle" con los offsets, que guardas en tu RoadMesh o
    // IntersectionMesh para luego poder editarlo o eliminarlo.
    // points tiene que ser flat 
    addPolygon(points, localIndices) {
        const gl = this.gl;
        const isTypedArray = points instanceof Float32Array;
        const vCount = isTypedArray ? points.length / 2 : points.length;
        const iCount = localIndices.length;

        const vOff = this._allocVertexSlot(vCount);
        const iOff = this._allocIndexSlot(iCount);

        // Volcar vértices: rápido si ya es Float32Array
        const base = vOff * FLOATS_PER_VERTEX;
        if (isTypedArray) {
            this.vertexData.set(points, base);          // memcpy, mucho más rápido
        } else {
            for (let i = 0; i < vCount; i++) {
            this.vertexData[base + i*2    ] = points[i].x;
            this.vertexData[base + i*2 + 1] = points[i].y;
            }
        }

        // Volcar índices, desplazados al offset global
        // Si localIndices ya es Uint32Array, podríamos hacer un memcpy + suma,
        // pero la suma obliga al bucle. Esto es lo que es.
        for (let i = 0; i < iCount; i++) {
            this.indexData[iOff + i] = localIndices[i] + vOff;
        }

        // Subir SOLO los rangos nuevos a la GPU
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, vOff * BYTES_PER_VERTEX,
                        this.vertexData,
                        vOff * FLOATS_PER_VERTEX,
                        vCount * FLOATS_PER_VERTEX);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, iOff * 4,
                        this.indexData, iOff, iCount);
    

        return {
            vertexOffset: vOff, vertexCount: vCount,
            indexOffset:  iOff, indexCount:  iCount,
        };
    }

    // ---------- removePolygon ahora libera de verdad ----------

    removePolygon(handle) {
        const gl = this.gl;
        // Marca los índices como triángulos degenerados por si el slot tarda
        // en reciclarse (evita que pinten basura entre el remove y el siguiente add)
        for (let i = 0; i < handle.indexCount; i++) {
            this.indexData[handle.indexOffset + i] = handle.vertexOffset;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER,
                        handle.indexOffset * 4,
                        this.indexData,
                        handle.indexOffset,
                        handle.indexCount);

        // Devuelve los slots a la free-list
        this._freeVertexSlot(handle.vertexOffset, handle.vertexCount);
        this._freeIndexSlot(handle.indexOffset,   handle.indexCount);
    }

    // ---------- API: modificar vértices de un polígono ----------
    //
    // Solo válido si el número de vértices NO cambia. Si cambia, hay que
    // liberar el slot y crear uno nuevo (eso lo añadimos cuando lo necesites).
    // no creo que lo utilice nunca
    updatePolygonVertices(handle, newPoints) {
        if(newPoints.length !== handle.vertexCount) {
            throw new Error('El número de vértices cambió. Usa removePolygon + addPolygon.');
        }
        const gl = this.gl;
        const base = handle.vertexOffset * FLOATS_PER_VERTEX;
        for(let i = 0; i < newPoints.length; i++) {
            this.vertexData[base + i * 2] = newPoints[i].x;
            this.vertexData[base + i * 2 + 1] = newPoints[i].y;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, handle.vertexOffset * BYTES_PER_VERTEX, this.vertexData, handle.vertexOffset * FLOATS_PER_VERTEX, handle.vertexCount * FLOATS_PER_VERTEX);
    }
    
    clearPixels(){
        const gl = this.gl;
        gl.clearColor(50.0/255, 50.0/255, 50.0/255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }


    // ---------- API: dibujar una lista de meshes visibles ----------
    //
    // visibleMeshes: array de objetos que tengan { indexOffset, indexCount }.
    // color: [r, g, b, a] en 0..1.
    //
    // Se llama una vez por "grupo de color". Por ejemplo:
    //   renderer.beginFrame();
    //   renderer.drawMeshes(visibleRoads,         [0.2, 0.2, 0.2, 1]);
    //   renderer.drawMeshes(visibleIntersections, [0.3, 0.3, 0.3, 1]);
    // usa el programa de superficies
    beginFrame(zoom, xOff, yOff) {
        const gl = this.gl;
        this._zoom = zoom;
        this._xOff = xOff;
        this._yOff = yOff;
        this.clearPixels();
        let program = this.programs.get('surfaceShader');
        gl.useProgram(program.program);
        gl.bindVertexArray(this.vao);

        gl.uniform2f(program.uResolution,   this.cssWidth, this.cssHeight);
        gl.uniform2f(program.uCameraOffset, xOff, yOff);
        gl.uniform1f(program.uCameraScale,  zoom);
    }

    drawHoverPolygon(corners, indices, color, borderWidth) {
        const gl = this.gl;
        const prog = this.programs.get('hoverShader');

        const cornersF32 = corners instanceof Float32Array ? corners : new Float32Array(corners);
        const n = cornersF32.length / 2;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(prog.program);
        gl.bindVertexArray(this.hoverVAO);

        // VBO dinámico
        gl.bindBuffer(gl.ARRAY_BUFFER, this.hoverVBO);
        gl.bufferData(gl.ARRAY_BUFFER, cornersF32, gl.DYNAMIC_DRAW);

        // IBO dinámico (el VAO ya tiene el IBO bindado)
        const idxArr = indices instanceof Uint16Array ? indices : new Uint16Array(indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxArr, gl.DYNAMIC_DRAW);

        // Subir corners a la textura RG32F (N x 1)
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.hoverCornersTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, n, 1, 0, gl.RG, gl.FLOAT, cornersF32);

        gl.uniform2f(prog.uResolution,   this.cssWidth, this.cssHeight);
        gl.uniform2f(prog.uCameraOffset, this._xOff, this._yOff);
        gl.uniform1f(prog.uCameraScale,  this._zoom);
        gl.uniform4f(prog.uColor,        color[0], color[1], color[2], color[3]);
        gl.uniform1f(prog.uBorderWidth,  borderWidth);
        gl.uniform1i(prog.uCorners,      0); // texture unit 0
        gl.uniform1i(prog.uCornersCount, n);

        gl.drawElements(gl.TRIANGLES, idxArr.length, gl.UNSIGNED_SHORT, 0);

        gl.bindVertexArray(null);
        gl.disable(gl.BLEND);
    }

    drawMeshes(visibleMeshes, color) {
        if(visibleMeshes.length === 0) return;
        const gl = this.gl;
        let program = this.programs.get('surfaceShader');
        // Set color para este grupo
        gl.uniform4f(program.uColor, color[0], color[1], color[2], color[3]);
        // Fusionar rangos contiguos en el IBO para minimizar draw calls.
        // Ordena por indexOffset (en tu app puedes hacerlo más eficiente si
        // mantienes los meshes pre-ordenados por offset). 
        let drawCalls = 0
        let rangeOffset = -1;
        let rangeCount = 0;
        for(const m of visibleMeshes) {
            if(rangeOffset === -1) {
                rangeOffset = m.indexOffset;
                rangeCount = m.indexCount;
            }
            else if(rangeOffset + rangeCount === m.indexOffset) {
                rangeCount += m.indexCount; // contiguo: fusionar
            }
            else {
                gl.drawElements(gl.TRIANGLES, rangeCount, gl.UNSIGNED_INT, rangeOffset * 4);
                rangeOffset = m.indexOffset;
                rangeCount = m.indexCount;
                drawCalls++;
            }
        }
        // Último rango pendiente
        if(rangeOffset !== -1) {
            gl.drawElements(gl.TRIANGLES, rangeCount, gl.UNSIGNED_INT, rangeOffset * 4);
            drawCalls++;
        }

        this.efficiency.drawCalls = drawCalls;
        this.efficiency.meshes = visibleMeshes.length;
    }

    getActualUsedSpace() {
        const activeVertices = this.vertexCursor - this.wastedVertices;
        const activeIndices  = this.indexCursor  - this.wastedIndices;

        const freeVertexBuckets = [];
        let freeVertexSlotCount = 0;
        for (const [size, bucket] of this.freeVertexSlots) {
            if (bucket.length > 0) {
                freeVertexSlotCount += bucket.length;
                freeVertexBuckets.push({ size, count: bucket.length, total: size * bucket.length });
            }
        }
        freeVertexBuckets.sort((a, b) => b.total - a.total);

        const freeIndexBuckets = [];
        let freeIndexSlotCount = 0;
        for (const [size, bucket] of this.freeIndexSlots) {
            if (bucket.length > 0) {
                freeIndexSlotCount += bucket.length;
                freeIndexBuckets.push({ size, count: bucket.length, total: size * bucket.length });
            }
        }
        freeIndexBuckets.sort((a, b) => b.total - a.total);

        return {
            vertices: {
                cursor:           this.vertexCursor,
                active:           activeVertices,
                freed:            this.wastedVertices,
                capacity:         MAX_VERTICES,
                usedPct:          (this.vertexCursor / MAX_VERTICES * 100).toFixed(1),
                fragmentationPct: this.vertexCursor > 0 ? (this.wastedVertices / this.vertexCursor * 100).toFixed(1) : '0.0',
                freeSlotCount:    freeVertexSlotCount,
                freeBuckets:      freeVertexBuckets.slice(0, 10),
            },
            indices: {
                cursor:           this.indexCursor,
                active:           activeIndices,
                freed:            this.wastedIndices,
                capacity:         MAX_INDICES,
                usedPct:          (this.indexCursor / MAX_INDICES * 100).toFixed(1),
                fragmentationPct: this.indexCursor > 0 ? (this.wastedIndices / this.indexCursor * 100).toFixed(1) : '0.0',
                freeSlotCount:    freeIndexSlotCount,
                freeBuckets:      freeIndexBuckets.slice(0, 10),
            },
            gpu: {
                vboUsedMB:  (this.vertexCursor * BYTES_PER_VERTEX / 1048576).toFixed(2),
                vboTotalMB: (MAX_VERTICES      * BYTES_PER_VERTEX / 1048576).toFixed(2),
                iboUsedMB:  (this.indexCursor  * 4               / 1048576).toFixed(2),
                iboTotalMB: (MAX_INDICES        * 4               / 1048576).toFixed(2),
            },
        };
    }

    getTotalTris(){
        let s = this.getActualUsedSpace();
        return s.indices.active / 3;
    }

    getVAOPercentage(){
        let s = this.getActualUsedSpace();
        return s.vertices.usedPct/100;
    }

    debugMemory() {
        const s = this.getActualUsedSpace();
        const lines = [
            '=== Renderer Memory Debug ===',
            '',
            '--- Vertices ---',
            `  Cursor (high-watermark): ${s.vertices.cursor} / ${s.vertices.capacity}  (${s.vertices.usedPct}% of capacity)`,
            `  Active right now:        ${s.vertices.active}`,
            `  In free-list (freed):    ${s.vertices.freed}  →  ${s.vertices.fragmentationPct}% fragmentation`,
            `  Free-list slot count:    ${s.vertices.freeSlotCount}`,
            `  VBO GPU range used:      ${s.gpu.vboUsedMB} MB / ${s.gpu.vboTotalMB} MB`,
            '',
            '--- Indices ---',
            `  Cursor (high-watermark): ${s.indices.cursor} / ${s.indices.capacity}  (${s.indices.usedPct}% of capacity)`,
            `  Active right now:        ${s.indices.active}`,
            `  In free-list (freed):    ${s.indices.freed}  →  ${s.indices.fragmentationPct}% fragmentation`,
            `  Free-list slot count:    ${s.indices.freeSlotCount}`,
            `  IBO GPU range used:      ${s.gpu.iboUsedMB} MB / ${s.gpu.iboTotalMB} MB`,
            '',
            '--- Top free-list buckets (vertices, by wasted space) ---',
            ...(s.vertices.freeBuckets.length
                ? s.vertices.freeBuckets.map(b => `  size=${b.size}: ${b.count} slot(s)  →  ${b.total} verts wasted`)
                : ['  (none)']),
            '',
            '--- Top free-list buckets (indices, by wasted space) ---',
            ...(s.indices.freeBuckets.length
                ? s.indices.freeBuckets.map(b => `  size=${b.size}: ${b.count} slot(s)  →  ${b.total} idxs wasted`)
                : ['  (none)']),
        ];
        console.log(lines.join('\n'));
        return s;
    }
}