var nicedatepicker = function() {
    
    var currentPositionX = 0 //当前div_wrap所在的值,即 translate3d 的X轴的值
    var currentPositionY = 0 //当前div_wrap所在的值,即 translate3d 的X轴的值
    var translateX = 0 //一次滑动X轴需要的距离
    var translateY = 0 //一次滑动Y轴需要的距离
    var allTable = [];
    var timeShow = null;
    var week = ['日', '一', '二', '三', '四', '五', '六']
    var nowYearAndM = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        div: null
    }
    var chooseDay = {
        month: null,
        day: null
    }
    this.chooseDay = chooseDay;
    this.nowYearAndM = nowYearAndM;
    
    var div = null; //外层div包裹
    var toDate = new Date(),
        toYear = toDate.getFullYear(),
        toMonth = toDate.getMonth() + 1,
        toDay = toDate.getDate();

    function datepicker_calCell(year, month) {
        var arrMonth = new Array(6);
        for (var i = 0; i < 6; i++) {
            arrMonth[i] = new Array(7);
        }

        var iDayOfFirst = (new Date(year, month - 1, 1)).getDay(); // 本月的 1号 是星期几。返回0为周日
        var iDaysInMonth = (new Date(year, month, 0)).getDate(); // 本月有多少天
        var iOffsetLast = (new Date(year, month - 1, 0)).getDate() - iDayOfFirst + 1; // 本月第一天的偏移量
        var iDate = 1;
        var iNext = 1;

        for (var w = 0; w < 6; w++) {
            for (var d = 0; d < 7; d++) {
                if (w == 0) {
                    arrMonth[w][d] = (d < iDayOfFirst ? -(iOffsetLast + d) : iDate++);
                } else {
                    arrMonth[w][d] = (iDate <= iDaysInMonth ? iDate++ : -(iNext++));
                }
            }
        }
        return arrMonth;
    };


    function createTable() {
        var timeTable = document.createElement('table');
        timeTable.className = 'timepicker_table';
        var width = translateX;
        var timeTbody = document.createElement('tbody');
        var timeThead = document.createElement('thead');
        allTable.push(timeTable);
        timeTable.appendChild(timeThead);
        var tr = document.createElement('tr');
        for (var col = 0; col < 7; col++) {
            var th = document.createElement('th');
            th.innerHTML = week[col];
            if ((col == 0) || (col == 6)) { // 周末
                th.className = "datepicker_week";
            }
            tr.appendChild(th);
        }
        timeThead.appendChild(tr)
        timeTable.appendChild(timeTbody);

        for (var row = 0; row < 6; row++) {
            var rowBack = timeTbody.insertRow(row);
            for (var col = 0; col < 7; col++) {
                var cell = rowBack.insertCell(col);
            }
        }
        return timeTable
    }

    function datepicker_reset(tableDom, year, month) {
        var arrMonth = datepicker_calCell(year, month);
        tableDom.year = year;
        tableDom.month = month;
        for (var w = 0; w < 6; w++) {
            for (var d = 0; d < 7; d++) {
                var cell = tableDom.tBodies[0].rows[w].cells[d];
                var theValue = arrMonth[w][d];
                if (theValue > 0) {
                    if ((d == 0) || (d == 6)) { // 周末
                        cell.className = "datepicker_week";
                    }
                    if (year == toYear && month == toMonth && theValue == toDay) {
                        cell.className += " datepicker_today"
                    }
                    var choosemonth = chooseDay.month;
                    var chooseday = chooseDay.day;
                    if (year == toYear && month == choosemonth && theValue == chooseday) {
                        cell.className += " timeChoose"
                    }
                    cell.innerHTML = theValue;
                } else {
                    cell.className = "datepicker_otherMonth";
                    cell.innerHTML = -theValue;
                }
            }
        }
    }


    function addEven(eventNode, tarnslateNode) {
        var startX = 0;
        var startY = 0;
        var startT = 0; //记录手指按下去的时间
        var moveLength = 0; //移动的距离
        var initialPos = 0; // 手指按下的屏幕位置
        var direction = "left"; //滑动的方向
        var leftFlag = false; //
        var flag = false; //
        var updown = false;
        var isMove = false;
        var deltaX = 0;
        var deltaY = 0;
        eventNode.addEventListener('touchstart', function(e) {
            e.preventDefault();
            var touch = e.touches[0];
            startX = touch.pageX;
            startY = touch.pageY;
            tarnslateNode.style.webkitTransition = "";
            tarnslateNode.style.transition = "";
            startT = new Date().getTime(); //记录手指按下的开始时间
            isMove = false;
            flag = false;
            updown = false;
        }, false);

        eventNode.addEventListener("touchmove", function(e) {
            e.preventDefault();
            var touch = e.touches[0];
            deltaX = touch.pageX - startX;
            deltaY = touch.pageY - startY;
            flag = flag ? true : Math.abs(deltaX) > Math.abs(deltaY);
            //如果X方向上的位移大于Y方向，则认为是左右滑动
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                isMove = true;
                if (flag && !updown) {
                    moveLength = deltaX;
                    var translate = currentPositionX + deltaX; //当前需要移动到的位置
                    tarnslateNode.style.webkitTransform = "translate3d(" + translate + "px," + currentPositionY + "px,0)";
                    direction = deltaX > 0 ? "right" : "left"; //判断手指滑动的方向
                } else {
                    updown = true;
                    moveLength = deltaY;
                    var translate = currentPositionY + deltaY; //当前需要移动到的位置
                    tarnslateNode.style.webkitTransform = "translate3d(" + currentPositionX + "px," + translate + "px,0)";
                    direction = deltaY > 0 ? "bottom" : "top"; //判断手指滑动的方向
                }
            }
        }, false);


        /*手指离开屏幕时，计算最终需要停留在哪一页*/
        eventNode.addEventListener("touchend", function(e) {
            //            e.preventDefault();
            var translate = 0;
            var styleTranslate = "";
            var pageWidth = eventNode.offsetWidth;
            var pageHeight = eventNode.offsetHeight;
            var topOrLeft = direction == 'left' || direction == 'right' ? true : false;
            var pageTurn = false;
            //计算手指在屏幕上停留的时间
            var deltaT = new Date().getTime() - startT;
            if (isMove) { //发生了滑动
                //使用动画过渡让页面滑动到最终的位置
                if (deltaT < 300) { //如果停留时间小于300ms,则认为是快速滑动，无论滑动距离是多少，都停留到下一页  
                    slideAccess(direction, tarnslateNode, deltaX, deltaY);

                } else {
                    //如果滑动距离小于屏幕的50%，则退回到上一页
                    if (Math.abs(moveLength) / pageWidth > 0.5) {
                        slideAccess(direction, tarnslateNode, deltaX, deltaY);
                    }
                }
                setTimeout(function() {
                    tarnslateNode.style.webkitTransition = ".5s ease -webkit-transform";
                    styleTranslate = "translate3d(" + currentPositionX + "px," + currentPositionY + "px,0)";
                    tarnslateNode.style.webkitTransform = styleTranslate;
                }, 50)
            }
        }, false);
    }

    function slideAccess(direction, tarnslateNode, deltaX, deltaY) {
        var leftOver = nowYearAndM.month == 12 ? true : false;
        var rightOver = nowYearAndM.month == 1 ? true : false;
        switch (direction) {
            case "left":
                if (leftOver) return false;
                if (rightOver) {
                    nowYearAndM.month += 1;
                    currentPositionX -= translateX;
                    setTimeShow(nowYearAndM.year, nowYearAndM.month);
                    return false;
                }
                nowYearAndM.month += 1;
                if (nowYearAndM.month == 12) {
                    currentPositionX -= translateX;
                    setTimeShow(nowYearAndM.year, nowYearAndM.month);
                    return false;
                }
                var nextMonth = nowYearAndM.month + 1;
                nowYearAndM.div = nowYearAndM.div.nextSibling;
                var divChild = creatDivChild();
                datepicker_reset(allTable[0], nowYearAndM.year - 1, nextMonth);
                datepicker_reset(allTable[1], nowYearAndM.year, nextMonth);
                datepicker_reset(allTable[2], nowYearAndM.year + 1, nextMonth);

                div.appendChild(divChild);
                div.removeChild(div.firstChild);
                tarnslateNode.style.webkitTransform = "translate3d(" + deltaX + "px," + currentPositionY + "px,0)"; //dom增删后对位置修正
                break;
            case "right":
                if (rightOver) return false;

                if (leftOver) {
                    nowYearAndM.month -= 1;
                    currentPositionX += translateX;
                    setTimeShow(nowYearAndM.year, nowYearAndM.month);
                    return false
                }
                nowYearAndM.month -= 1;
                if (nowYearAndM.month == 1) {
                    currentPositionX += translateX;
                    setTimeShow(nowYearAndM.year, nowYearAndM.month);
                    return false;
                }
                nowYearAndM.div = nowYearAndM.div.previousSibling;
                var prevMonth = nowYearAndM.month - 1;
                var divChild = creatDivChild();
                datepicker_reset(allTable[0], nowYearAndM.year - 1, prevMonth);
                datepicker_reset(allTable[1], nowYearAndM.year, prevMonth);
                datepicker_reset(allTable[2], nowYearAndM.year + 1, prevMonth);

                div.insertBefore(divChild, nowYearAndM.div);
                div.removeChild(div.lastChild);
                var tranform = currentPositionX + currentPositionX + deltaX; //dom增删后对位置修正
                tarnslateNode.style.webkitTransform = "translate3d(" + tranform + "px," + currentPositionY + "px,0)";
                break;
            case "top":
                nowYearAndM.year += 1;
                var allChild = div.children;
                var nextYear = nowYearAndM.year + 1
                for (var i = 0; i < allChild.length; i++) {
                    allChild[i].appendChild(createTable());
                    allChild[i].removeChild(allChild[i].firstChild)
                }
                datepicker_reset(allTable[0], nextYear, nowYearAndM.month - 1);
                datepicker_reset(allTable[1], nextYear, nowYearAndM.month);
                datepicker_reset(allTable[2], nextYear, nowYearAndM.month + 1);
                tarnslateNode.style.webkitTransform = "translate3d(" + currentPositionX + "px," + deltaY + "px,0)"; //dom增删后对位置修正
                break;
            case "bottom":
                nowYearAndM.year -= 1;
                var allChild = div.children;
                var prevYear = nowYearAndM.year - 1
                for (var i = 0; i < allChild.length; i++) {
                    allChild[i].insertBefore(createTable(), allChild[i].firstChild);
                    allChild[i].removeChild(allChild[i].lastChild);
                }
                datepicker_reset(allTable[0], prevYear, nowYearAndM.month - 1);
                datepicker_reset(allTable[1], prevYear, nowYearAndM.month);
                datepicker_reset(allTable[2], prevYear, nowYearAndM.month + 1);
                console.log(currentPositionY, deltaY);
                var tranform = currentPositionY + currentPositionY + deltaY; //dom增删后对位置修正
                tarnslateNode.style.webkitTransform = "translate3d(" + currentPositionX + "px," + tranform + "px,0)";
                break;
            default:
                break;
        }
        allTable = [];
        setTimeShow(nowYearAndM.year, nowYearAndM.month);
    }

    function setTimeShow(year, month) {
        if (month < 10) {
            month = "0" + month;
        }
        timeShow.innerHTML = year + " 年 " + month + " 月 ";
    }

    //生成表格的包裹 DIV插入,并生成日历
    function creatDivChild() {
        var divChild = document.createElement('div')
        divChild.className = "tableWrap";
        div.appendChild(divChild);
        for (var i = 0; i < 3; i++) {
            divChild.appendChild(createTable())
        }
        return divChild
    }

    this.init = function(target, Show) {
        translateX = target.offsetWidth;

        div = document.createElement('div');
        div.className = 'timeTable_warp';
        target.appendChild(div);
        var table = null;
        var nowYear = nowYearAndM.year;
        var nowMonth = nowYearAndM.month;
        var divChild = null;

        target.style.position = "relative";
        timeShow = Show;
        timeShow.className = "datepicker_show";
        setTimeShow(nowYear, nowMonth);

        //插入表格
        for (var d = 0; d < 3; d++) {
            divChild = creatDivChild();
            if (d === 1) {
                nowYearAndM.div = divChild
            }
        }

        //填表格日历
        datepicker_reset(allTable[0], nowYear - 1, nowMonth - 1);
        datepicker_reset(allTable[1], nowYear, nowMonth - 1);
        datepicker_reset(allTable[2], nowYear + 1, nowMonth - 1);
        datepicker_reset(allTable[3], nowYear - 1, nowMonth);
        datepicker_reset(allTable[4], nowYear, nowMonth);
        datepicker_reset(allTable[5], nowYear + 1, nowMonth);
        datepicker_reset(allTable[6], nowYear - 1, nowMonth + 1);
        datepicker_reset(allTable[7], nowYear, nowMonth + 1);
        datepicker_reset(allTable[8], nowYear + 1, nowMonth + 1);
        allTable = [];

        translateY = divChild.children[0].offsetHeight;

        currentPositionX = -translateX;
        currentPositionY = -translateY;
        target.style.height = translateY + "px";
        target.style.overflow = "hidden";
        div.style.webkitTransform = 'translate3d(' + -translateX + "px," + -translateY + "px,0)";
        addEven(target, div);
        return this;
    }
}