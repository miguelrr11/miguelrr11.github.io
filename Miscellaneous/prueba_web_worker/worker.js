onmessage = function(message) {
    let arr = message.data[0];
    let neigh = message.data[1];
    
    let new_arr = [];
    for (let i = 0; i < arr.length; i++) {
        new_arr[i] = [];
    }

    //console.log(message.data[2])

    let sum, div;
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[0].length; j++) {
            sum = 0;
            div = 0;
            for (let n of neigh) {
                let ni = i + n[0];
                let nj = j + n[1];

                if (ni >= 0 && ni < arr.length && nj >= 0 && nj < arr[0].length) {
                    sum += arr[ni][nj];
                    div++;
                }
            }

            new_arr[i][j] = sum / div;
        }
    }

    // Return only the relevant section of the array
    postMessage(new_arr)
}
