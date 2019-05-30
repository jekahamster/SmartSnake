function InputCalculator() {



    this.calc = function (matrix, hc) {             // matrix, headcoordinates[]

        const hcX = hc[0];
        const hcY = hc[1];

        const rows      = matrix.length;
        const columns   = matrix[0].length;

        var distance_apple = {
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
        }
        
        var distance_body = {
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
        }

        var distance_border = {
            top: 0,
            left: 0, 
            right: 0,
            bottom: 0,
        }

        distance_apple.left     = _left("apple", matrix, hcX, hcY);
        distance_border.left    = _left("border", matrix, hcX, hcY);
        distance_body.left      = _left("body", matrix, hcX, hcY);
        
        distance_apple.right    = _right("apple", matrix, hcX, hcY);
        distance_border.right   = _right("border", matrix, hcX, hcY);
        distance_body.right     = _right("body", matrix, hcX, hcY);

        distance_apple.top      = _top("apple", matrix, hcX, hcY);
        distance_border.top     = _top("border", matrix, hcX, hcY);
        distance_body.top       = _top("body", matrix, hcX, hcY);

        distance_apple.bottom   = _bottom("apple", matrix, hcX, hcY);
        distance_border.bottom  = _bottom("border", matrix, hcX, hcY);
        distance_body.bottom    = _bottom("body", matrix, hcX, hcY);

        console.log("Apple top: " + distance_apple.top);
        console.log("Apple bottom: " + distance_apple.bottom);
        console.log("Apple left: " + distance_apple.left);
        console.log("Apple right: " + distance_apple.right);
        console.log("\n\n");
        
    }
    
    function _left(obj, matrix, hcX, hcY) {
        let len = 0;
        for (let i = hcX-1; i >= 0; i--) {
            len++;
            if (matrix[hcY][i] == objectValue[obj])
            {
                return len;
            }
        }
        if (obj != "apple")
            return hcX+1;
        return -1;
    }

    function _right(obj, matrix, hcX, hcY) {
        let len = 0;
        for (let i = hcX+1; i < matrix[0].length; i++) {
            len++;
            if (matrix[hcY][i] == objectValue[obj])
            {
                return len;
            }
        }
        if (obj != "apple")
            return hcX+1;
        return -1;
    }

    function _top(obj, matrix, hcX, hcY) {
        let len = 0;
        for (let i = hcY-1; i >= 0; i--) {
            len++;
            if (matrix[i][hcX] == objectValue[obj])
            {
                return len;
            }
        }
        if (obj != "apple")
            return hcY+1;
        return -1;
    }

    function _bottom(obj, matrix, hcX, hcY) {
        let len = 0;
        for (let i = hcY+1; i < matrix.length; i++) {
            len++;
            if (matrix[i][hcX] == objectValue[obj])
            {
                return len;
            }
        }
        if (obj != "apple")
            return hcY+1;
        return -1;
    } 

}