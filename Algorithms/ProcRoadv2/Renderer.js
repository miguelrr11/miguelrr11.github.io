const FLOATS_PER_VERTEX = 2; // solo x, y
const BYTES_PER_VERTEX = FLOATS_PER_VERTEX * 4;
const MAX_VERTICES = 2_500_000;
const MAX_INDICES = 7_500_000;

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

        // Free-list: huecos disponibles, agrupados por tamaño.
        // Clave: vertexCount, Valor: array de slots libres con ese tamaño.
        this.freeVertexSlots = new Map();
        this.freeIndexSlots  = new Map();

        // Contadores para saber cuánto espacio desperdiciado tenemos
        this.wastedVertices = 0;
        this.wastedIndices  = 0;

        let gl = this.gl;
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData.byteLength, gl.DYNAMIC_DRAW);

        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData.byteLength, gl.DYNAMIC_DRAW);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.enableVertexAttribArray(this.aPos);
        gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, BYTES_PER_VERTEX, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bindVertexArray(null);

        this.initShaders();
        this.initBuffers();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
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
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, this.compile(this.gl.VERTEX_SHADER, vsSrc));
        this.gl.attachShader(this.program, this.compile(this.gl.FRAGMENT_SHADER, fsSrc));
        this.gl.linkProgram(this.program);
        if(!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) throw new Error(this.gl.getProgramInfoLog(this.program));
        this.gl.useProgram(this.program);
        // Atributos
        this.aPos = this.gl.getAttribLocation(this.program, 'aPos');
        // Uniforms
        this.uResolution = this.gl.getUniformLocation(this.program, 'uResolution');
        this.uCameraOffset = this.gl.getUniformLocation(this.program, 'uCameraOffset');
        this.uCameraScale = this.gl.getUniformLocation(this.program, 'uCameraScale');
        this.uColor = this.gl.getUniformLocation(this.program, 'uColor');
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
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.enableVertexAttribArray(this.aPos);
        gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, BYTES_PER_VERTEX, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bindVertexArray(null);
    }

    resizeCanvas() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if(this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w;
            this.canvas.height = h;
        }
        this.gl.viewport(0, 0, w, h);
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
    beginFrame(zoom, xOff, yOff) {
        const gl = this.gl;
        this.clearPixels();
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // gl.uniform2f(this.uResolution,   width, height);
        // gl.uniform2f(this.uCameraOffset, this.tool.xOff, this.tool.yOff);
        // gl.uniform1f(this.uCameraScale,  this.tool.zoom);

        gl.uniform2f(this.uResolution,   width, height);
        gl.uniform2f(this.uCameraOffset, xOff, yOff);
        gl.uniform1f(this.uCameraScale,  zoom);
    }

    drawMeshes(visibleMeshes, color) {
        if(visibleMeshes.length === 0) return;
        const gl = this.gl;
        // Set color para este grupo
        gl.uniform4f(this.uColor, color[0], color[1], color[2], color[3]);
        // Fusionar rangos contiguos en el IBO para minimizar draw calls.
        // Ordena por indexOffset (en tu app puedes hacerlo más eficiente si
        // mantienes los meshes pre-ordenados por offset).  
        visibleMeshes.sort((a, b) => a.indexOffset - b.indexOffset);
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
            }
        }
        // Último rango pendiente
        if(rangeOffset !== -1) {
            gl.drawElements(gl.TRIANGLES, rangeCount, gl.UNSIGNED_INT, rangeOffset * 4);
        }
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