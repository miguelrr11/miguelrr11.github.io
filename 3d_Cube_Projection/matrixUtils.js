//Matrix operations
//Miguel Rodríguez Rodríguez
//30-08-2024

function initmat(m, n){
    let res = []
    for(let i = 0; i < m; i++){
        res[i] = []
        for(let j = 0; j < n; j++){
            res[i][j] = 0
        }
    }
    return res
}

function mattrans(a_){
    let a = vec2mat(a_)
    
    let res = initmat(a[0].length, a.length)
    for(let i = 0; i < a.length; i++){
        for(let j = 0; j < a[0].length; j++){
            res[j][i] = a[i][j]
        }
    }

    return res
}

function matscale(a_, scale){
    let a = vec2mat(a_)

    let res = initmat(a.length, a[0].length)
    for(let i = 0; i < a.length; i++){
        for(let j = 0; j < a[0].length; j++){
            res[i][j] = a[i][j] * scale
        }
    }

    return res
}

function matsub(a_, b_){
    let a = vec2mat(a_)
    let b = vec2mat(b_)

    let ma = a.length
    let na = a[0].length
    let mb = b.length
    let nb = b[0].length

    if(ma != mb || na != nb){
        console.log("Incompatible matrix sizes")
        return false
    }

    let res = initmat(a.length, a[0].length)

    for(let i = 0; i < ma; i++){
        for(let j = 0; j < na; j++){
            res[i][j] = a[i][j] - b[i][j]
        }
    }
    
    return res
}

function matsum(a_, b_){
    let a = vec2mat(a_)
    let b = vec2mat(b_)

    let ma = a.length
    let na = a[0].length
    let mb = b.length
    let nb = b[0].length

    if(ma != mb || na != nb){
        console.log("Incompatible matrix sizes")
        return false
    }

    let res = initmat(a.length, a[0].length)

    for(let i = 0; i < ma; i++){
        for(let j = 0; j < na; j++){
            res[i][j] = a[i][j] + b[i][j]
        }
    }
    
    return res
}

function matmult(a_, b_){
    let a = vec2mat(a_)
    let b = vec2mat(b_)
    
    let ma = a.length
    let na = a[0].length
    let mb = b.length
    let nb = b[0].length


    if(na != mb){ 
        console.log("Incompatible matrix sizes")
        return false
    }

    
    
    let res = initmat(ma, nb)

    for(let i = 0; i < ma; i++){
        for(let j = 0; j < nb; j++){
            for(let k = 0; k < na; k++){
                res[i][j] += a[i][k] * b[k][j]
            }
        }
    }

    return res
}

function matdet(mat){
    let ma = mat.length
    let na = mat[0].length

    if(ma == na && ma == 2){
        return mat[0][0] * mat[1][1] - (mat[0][1] * mat[1][0])
    }

    else if(ma == na && ma == 3){
        let a = mat[0][0], b = mat[0][1], c = mat[0][2]
        let d = mat[1][0], e = mat[1][1], f = mat[1][2]
        let g = mat[2][0], h = mat[2][1], i = mat[2][2]

        return a * (e * i - f * h) - 
               b * (d * i - f * g) + 
               c * (d * h - e * g)
    }

    else{
        console.log("Incompatible matrix size")
        return false
    }
}

function vec2mat(a_){
    let a = []
    if(a_[0].length == undefined){
        for(let i = 0; i < a_.length; i++){ 
            a[i] = []
        }
        a[0][0] = a_[0]
        a[1][0] = a_[1]
        a[2][0] = a_[2]

        return a
    }
    else return a_
}