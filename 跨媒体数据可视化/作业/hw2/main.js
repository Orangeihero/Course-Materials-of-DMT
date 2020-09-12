window.onload = function () {
    myTreemap.draw(data);

    //鼠标悬停操作
    document.getElementById('myCanvas').addEventListener("mousemove", (e) => {
        if (isLocal == 0) {
            //判断鼠标所在点在那个区域，显示标签及对应的value值
            var i = inWhichArea(context, e.offsetX, e.offsetY);
            context.beginPath();
            tip_div.style.display = "block";
            tip_div.getElementsByTagName("strong")[0].innerHTML = 'Value:' + (data_s[i]);
            tip_div.style.left = e.pageX + 10 + "px";
            tip_div.style.top = e.pageY + 10 + "px";
        }

    })

    //鼠标移走操作
    document.getElementById('myCanvas').addEventListener("mouseleave", () => {
        tip_div.style.display = "none";
    })
    
    //鼠标点击操作
    document.getElementById('myCanvas').addEventListener("mouseup", (e) => {
        if (isLocal == 0) { //如果点击时是整体视图（所有值都存在）
            isLocal = 1 //改变状态值
            
            var i = inWhichArea(context, e.offsetX, e.offsetY);
            var rectangle = areas[i];
            var x1 = rectangle.x1;
            var left_width = x1; // 距离画布最左边的距离
            var x2 = rectangle.x2;
            var right_width = all_size.width - x2; // 距离画布最右边的距离
            var y1 = rectangle.y1;
            var up_height = y1; // 距离画布最顶端的距离
            var y2 = rectangle.y2;
            var down_height = all_size.height - y2; // 距离画布最底端的距离
            context.beginPath(); // 开始

            // 放大动画
            animation(0);
            function animation(j) {

                // 改变绘制矩形的横纵坐标
                x1 = x1 - left_width / 10;
                x2 = x2 + right_width / 10;
                y1 = y1 - up_height / 10;
                y2 = y2 + down_height / 10;
                
                //绘制矩形
                context.fillStyle = '#00624b'
                context.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1); //创建矩形
                context.strokeStyle = '#FFFFFF';
                context.strokeRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
                context.lineWidth = 1;
                context.strokeStyle = 'white';
                context.stroke();
                context.font = '50px Verdana';
                context.fillStyle = '#000000';
                context.fillText(data_s[i], (x1 + x2) / 2 - 30, (y1 + y2) / 2 + 15);
                
                //动画效果
                setTimeout(function () {
                    if (j < 9) {
                        animation(j + 1)
                    }
                }, 30);
            }
        } else { //如果是局部的视图
            isLocal = 0; //改变状态
            myTreemap.draw(data_s) //根据数据重画视图
        }
    })

    //判断数据有无变化并实时更新
    document.getElementById('input').oninput = function () {
        var value = document.getElementById('input').value;
        var data = JSON.parse('[' + value + ']');
        myTreemap.draw(data);
    };
}

//标签信息
var tip_div = document.getElementById("tip");

// 画布信息，新建Treemap
var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
var myTreemap = new Treemap(canvas, context);

// 读入数据并转为数组
var value = document.getElementById('input').value;
var data = JSON.parse('[' + value + ']');

var areas; //整个画布的所有区域
var isLocal = 0; //判断整体状态还是局部状态
var data_s; //经过处理的data数据
var all_size = {width: 0, height: 0} //所有的固定区域


//判断鼠标所在点在哪个区域内
function inWhichArea(context, mouseX, mouseY) {
    context.beginPath(); // 开始绘制
    var i;
    for (i = 0; i < areas.length; i++) {
        context.rect(areas[i].x1, areas[i].y1, (areas[i].x2 - areas[i].x1 + 1), (areas[i].y2 - areas[i].y1 + 1));
        let result = context.isPointInPath(mouseX, mouseY);
        if (result) {
            return i;
        }
    }
};

function Treemap(canvas, context){
    var current_offset = {x: 0, y: 0}; //当前空白区域最左最上的坐标
    var current_size = {width: 0, height: 0, area: 0} //当前空白区域剩余的宽、高和面积
    var remaining_area = 0; //当前空白区域

    // 处理数据
    function processData(data) {
        // 将数据进行从小到大排序
        data.sort(function (a, b) {
            return a - b;
        });

        // 删掉数据中的0
        while (data.length > 0 && data[0] == 0) {
            data.shift();
        }

        // 颠倒数据顺序，使其从大到小
        data.reverse();
        return data;
    }


    // 安排填色区域
    function arrangeAreas(data) {
        var local_area = calLocalArea(data);
        squarify(local_area, []);
    }

    // 计算出每一个数据应该占有多少面积
    function calLocalArea(data) {
        var local = [];
        var all = all_size.width * all_size.height;
        var sum = sumData(data);

        data.forEach(function (element) {
            var temp_local = (element / sum) * all;
            local.push(temp_local);
        });

        return local;
    }

    // 计算所有数值的总和
    function sumData(data) {
        var sum;

        if (data.length == 0) {
            sum = 0;
        } else {
            if (data.length == 1) {
                sum = data[0];
            } else {
                sum = data.reduce(function (previous, current) {
                    return previous + current;
                });
            }
        }
        return sum;
    }

    function squarify(children, row) {
        if (children.length > 0) {
            var w = Math.min(current_size.width,current_size.height); //现存空白区域较短的边
            var head = children.slice(0, 1); //第一个
            var tail = children.slice(1); //剩下的所有
            var row_plus = row.concat(head);

            // 判断是否应该与下一个数字一起
            if (worst(row, w) >= worst(row_plus, w)) { //比例变小，与下一个数字一起
                squarify(tail, row_plus);
            } else { //比例变大，可以直接安排区域面积
                layout(row);
                squarify(children, []);
            }
        } else {
            layout(row);
        }
    }

    // 计算比例
    function worst(areas, length) {
        var worst_ratio;

        if (areas.length == 0) {
            worst_ratio = 999999;
        } else {
            var area_min = Math.min.apply(null, areas);
            var area_max = Math.max.apply(null, areas);
            var area_sum = sumData(areas);

            var worst1 = (length * length * area_max) / (area_sum * area_sum);
            var worst2 = (area_sum * area_sum) / (length * length * area_min);
            worst_ratio = Math.max(worst1, worst2);
        }

        return worst_ratio;
    }

    // 给现有的区域安排数据
    function layout(row) {
        
        var temp_offset;

        if (shortSide() == 'height') {

            // 计算出所有area应占的宽度
            var row_area = sumData(row); //列表中所有area的总和
            var area_percentage = row_area / remaining_area; //这些area的总和占剩下的所有面积的大小
            var layout_width = Math.round(current_size.width * area_percentage); //所占宽的多少
            var temp_height = current_size.height;
            temp_offset = current_offset.y;

            while (row.length > 0) {

                // 计算每个单元所占的位置
                var element_area = row[0];
                var element_percantage = element_area / sumData(row);
                var element_height = Math.round(temp_height * element_percantage);
                var x1 = current_offset.x;
                var y1 = temp_offset;
                var x2 = x1 + layout_width - 1;
                var y2 = y1 + element_height - 1;
                areas[areas.length] = {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2};

                // 改变现存局部空闲区域的高度和坐标
                temp_height = temp_height - element_height;
                temp_offset = temp_offset + element_height;
                row.shift();
            }

            current_offset.x = current_offset.x + layout_width;
            current_size.width = current_size.width - layout_width;
            current_size.area = current_size.width * current_size.height;
            remaining_area = remaining_area - row_area;

        } else {

            // 计算出所有area应占的高度
            var row_area = sumData(row); //列表中所有area的总和
            var area_percentage = row_area / remaining_area; //这些area的总和占剩下的所有面积的大小
            var layout_height = Math.round(current_size.height * area_percentage);
            var temp_width = current_size.width;
            temp_offset = current_offset.x;

            while (row.length > 0) {

                // 计算每个单元所占的位置
                var element_area = row[0];
                var element_percantage = element_area / sumData(row);
                var element_width = Math.round(temp_width * element_percantage);
                var x1 = temp_offset;
                var y1 = current_offset.y;
                var x2 = x1 + element_width - 1;
                var y2 = y1 + layout_height - 1;
                areas[areas.length] = {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2};

                // 改变现存局部空闲区域的宽度和坐标
                temp_width = temp_width - element_width;
                temp_offset = temp_offset + element_width;
                row.shift();
            }

            current_offset.y = current_offset.y + layout_height;
            current_size.height = current_size.height - layout_height;
            current_size.area = current_size.width * current_size.height;
            remaining_area = remaining_area - row_area;
        }

    }

    function shortSide() {
        var short_side;

        if (current_size.width >= current_size.height) {
            short_side = 'height';
        } else {
            short_side = 'width';
        }

        return short_side;
    }


    function drawArea(i) {
        var rectangle = areas[i];
        var width = rectangle.x2 - rectangle.x1 + 1;
        var height = rectangle.y2 - rectangle.y1 + 1;

        // 开始绘制
        context.beginPath();

        // 绘制矩形
        context.fillStyle = '#00624b'
        context.fillRect(rectangle.x1, rectangle.y1, width, height); //创建矩形
        context.strokeStyle = '#FFFFFF';
        context.strokeRect(rectangle.x1, rectangle.y1, width, height);
        context.lineWidth = 1;
        context.strokeStyle = 'white';
        context.stroke();

        // 添加文字t
        context.font = '10px Verdana';
        context.fillStyle = '#000000';
        context.fillText('Value:' + (data_s[i]), rectangle.x1 + 3, rectangle.y1 + 15);
        context.fillText('x:' + (rectangle.x1) + ',y:' + (rectangle.y1), rectangle.x1 + 3, rectangle.y1 + 30);
        context.fillText('w:' + width + ',h:' + height, rectangle.x1 + 3, rectangle.y1 + 45);

        if (i < areas.length-1) {
            setTimeout(function () {
                drawArea(i + 1)
            }, 10);
        }
    }


    this.draw = function (data) { //绘制Treemap
        var width = context.canvas.width;
        var height = context.canvas.height;

        all_size = { //所有区域
            width: width,
            height: height
        };

        current_size = { //当前空白区域剩余的宽、高和面积
            width: width,
            height: height,
            area: width * height
        };

        current_offset = { //当前空白区域最左最上的坐标
            x: 0,
            y: 0
        };

        data_s = [];
        areas = [];
        remaining_area = current_size.area;

        data_s = processData(data); //对数据进行处理（排序并删掉其中的0）

        if (data.length > 0) {
            arrangeAreas(data_s);
            drawArea(0);
        } else {
            context.clearRect(0,0,all_size.width,all_size.height)
        }

    }
}