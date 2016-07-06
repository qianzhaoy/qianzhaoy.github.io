/*!	date_picker v1.0 吾儿网<http://www.520wawa.com>
	日期控件
	
	author: 浙大灵通.江奕浩
*/

var date_picker = function()
{
	var datepicker_backDiv = null;
	var datepicker_yearInput = null;
	var datepicker_monthSelect = null;
	var datepicker_today = null;
	var datepicker_tableBody = null;
	var datepicker_currObj = null;
	var datepicker_timeoutId = null;
	var datepicker_zIndex = -1;
	
	function datepicker_now(now)
	{
		return now.getFullYear() + "-" + datepicker_format(now.getMonth() + 1, 2) + "-" + datepicker_format(now.getDate(), 2);
	};
	
	function datepicker_returnEmpty()
	{
		datepicker_return("");
	};
	
	function datepicker_returnToday()
	{
		datepicker_return(datepicker_now(new Date()));
	};
	
	function datepicker_prevYear()
	{
		var year = parseInt(datepicker_yearInput.value) - 1;
		if (year > -1) {
			datepicker_yearInput.value = year;
			datepicker_reset(datepicker_yearInput.value, datepicker_monthSelect.value);
		}
		datepicker_yearInput.focus();
	};
	
	function datepicker_nextYear()
	{
		datepicker_yearInput.value = parseInt(datepicker_yearInput.value) + 1;
		datepicker_reset(datepicker_yearInput.value, datepicker_monthSelect.value);
		datepicker_yearInput.focus();
	};
	
	function datepicker_changeMonth()
	{
		datepicker_reset(datepicker_yearInput.value, datepicker_monthSelect.value);
	};

	function datepicker_changeYear()
	{
		var oEvent = (window.event ? window.event : arguments.callee.caller.arguments[0]);
		if (oEvent.keyCode == 27) {
			datepicker_hide();
		} else {
			datepicker_yearInput.value = datepicker_yearInput.value.replace(/\D+/g, '');	//判断是否满足年的数字
			if (datepicker_yearInput.value.length == 4) {
				datepicker_reset(datepicker_yearInput.value, datepicker_monthSelect.value);
			}
		}
	};

	// 返回的值里，非本月的日期都是负数
	function datepicker_calCell(year, month)
	{
		var arrMonth = new Array(6);
		for (var i = 0; i < 6; i++) {
			arrMonth[i] = new Array(7);
		}

		var iDayOfFirst = (new Date(year, month - 1, 1)).getDay();		// 本月的 1号 是星期几。返回0为周日
		var iDaysInMonth = (new Date(year, month, 0)).getDate();			// 本月有多少天
		var iOffsetLast = (new Date(year, month - 1, 0)).getDate() - iDayOfFirst + 1;		// 本月第一天的偏移量
		var iDate = 1;
		var iNext = 1;

		for (var w = 0; w < 6; w++)
		{
			for (var d = 0; d < 7; d++)
			{
				if (w == 0) {
					arrMonth[w][d] = (d < iDayOfFirst ? -(iOffsetLast + d) : iDate++);
				} else {
					arrMonth[w][d] = (iDate <= iDaysInMonth ? iDate++ : -(iNext++));
				}
			}
		}
		return arrMonth;
	};
	
	function datepicker_reset(year, month)
	{
		datepicker_yearInput.value = year;
		datepicker_monthSelect.value = month;
		arrMonth = datepicker_calCell(year, month);
		var theMonth = "prevMonth";
		for (w = 0; w < 6; w++)
		{
			for (d = 0; d < 7; d++)
			{
				var cell = datepicker_tableBody.rows[w + 1].cells[d];
				var theValue = arrMonth[w][d];
				if (theValue < 0) {
					cell.className = "datepicker_cell datepicker_day datepicker_otherMonthOut";
					cell.innerHTML = -theValue;
					if (theMonth == "currMonth") {
						theMonth = "nextMonth";
					}
				} else {
					if ((d == 0) || (d == 6)) {		// 周末
						cell.className = "datepicker_cell datepicker_day datepicker_weekEndOut";
						cell.date_picker_weekend = true;
					} else {
						cell.className = "datepicker_cell datepicker_day datepicker_currMonthOut";
						cell.date_picker_weekend = false;
					}
					cell.innerHTML = theValue;
					if (theMonth == "prevMonth") {
						theMonth = "currMonth";
					}
				}
				cell.date_picker_month = theMonth;
			}
		}
	};

	function datepicker_initSelect(target, suffix, begin, end)
	{
		for (var i = begin; i <= end; i++){
			target.options.add(new Option(i + suffix, i));
		}
	};

	function datepicker_createTable()
	{
		datepicker_backDiv = document.createElement("div");
		datepicker_backDiv.id = "datepicker_backDiv";
		if (document.body.childNodes.length > 0){
			document.body.insertBefore(datepicker_backDiv, document.body.childNodes[0]);
		} else {
			document.body.appendChild(datepicker_backDiv);
		}

		var tableBack = document.createElement("table");
		tableBack.className = "datepicker_table";
		datepicker_backDiv.appendChild(tableBack);
		
		var tableBody = document.createElement("tbody");
		tableBack.appendChild(tableBody);
		
		var rowBack = tableBody.insertRow(0);
		var cell = rowBack.insertCell(0);
		cell.className = "datepicker_yearChange";

		var buttonInput = document.createElement("input");
		buttonInput.type = "button";
		buttonInput.value = "<";
		buttonInput.onmouseup = datepicker_prevYear;
		buttonInput.onblur = datepicker_blur;
		buttonInput.onfocus = datepicker_focus;
		cell.appendChild(buttonInput);

		cell = rowBack.insertCell(1);
		cell.id = "datepicker_yearInput";
		
		datepicker_yearInput = document.createElement("input");
		datepicker_yearInput.type = "text";
		datepicker_yearInput.onkeyup = datepicker_changeYear;
		datepicker_yearInput.onblur = datepicker_blur;
		datepicker_yearInput.onfocus = datepicker_focus;
		cell.appendChild(datepicker_yearInput);

		cell = rowBack.insertCell(2);
		cell.className = "datepicker_yearChange";

		buttonInput = document.createElement("input");
		buttonInput.type = "button";
		buttonInput.value = ">";
		buttonInput.onmouseup = datepicker_nextYear;
		buttonInput.onblur = datepicker_blur;
		buttonInput.onfocus = datepicker_focus;
		cell.appendChild(buttonInput);

		cell = rowBack.insertCell(3);

		datepicker_monthSelect = document.createElement("select");
		datepicker_initSelect(datepicker_monthSelect, "月", 1, 12);
		datepicker_monthSelect.id = "datepicker_monthSelect";
		datepicker_monthSelect.onchange = datepicker_changeMonth;
		if (document.all){
			datepicker_monthSelect.onkeyup = function() {
				if (window.event.keyCode == 27) {
					datepicker_hide();
				}
			}
		} else {
			datepicker_monthSelect.onkeyup = function(evt) {
				var oEvent = (window.event ? window.event : evt);
				switch (oEvent.keyCode)
				{
					case 27:
						datepicker_hide();
						break;
					case 33:
					case 34:
					case 37:
					case 38:
					case 39:
					case 40:
						var e = document.createEvent('HTMLEvents');
						e.initEvent("change", true, true);
						evt.target.dispatchEvent(e);
						break;
				}
			}
		}
		datepicker_monthSelect.onblur = datepicker_blur;
		datepicker_monthSelect.onfocus = datepicker_focus;
		cell.appendChild(datepicker_monthSelect);
		
		tableBack = document.createElement("table");
		tableBack.className = "datepicker_table";
		datepicker_backDiv.appendChild(tableBack);
		
		tableBody = document.createElement("tbody");
		datepicker_tableBody = tableBody;
		tableBack.appendChild(tableBody);
		
		for (var row = 0; row < 7; row++)
		{
			rowBack = tableBody.insertRow(row);
			for (var col = 0; col < 7; col++)
			{
				cell = rowBack.insertCell(col);
				if (row == 0)
				{
					cell.className = "datepicker_cell datepicker_title";
					switch (col)
					{
						case 0:
							cell.innerHTML = "日";
							break;
						case 1:
							cell.innerHTML = "一";
							break;
						case 2:
							cell.innerHTML = "二";
							break;
						case 3:
							cell.innerHTML = "三";
							break;
						case 4:
							cell.innerHTML = "四";
							break;
						case 5:
							cell.innerHTML = "五";
							break;
						case 6:
							cell.innerHTML = "六";
							break;
					}
				} else {
					cell.onmouseover = function(evt) {
						var source = (window.event ? window.event.srcElement : evt.target);
						if (source.date_picker_month == "currMonth") {
							if (source.date_picker_weekend) {
								source.className = "datepicker_cell datepicker_day datepicker_weekEndOver";
							} else {
								source.className = "datepicker_cell datepicker_day datepicker_currMonthOver";
							}
						} else {
							source.className = "datepicker_cell datepicker_day datepicker_otherMonthOver";
						}
					};
					cell.onmouseout = function(evt) {
						var source = (window.event ? window.event.srcElement : evt.target);
						if (source.date_picker_month == "currMonth") {
							if (source.date_picker_weekend) {
								source.className = "datepicker_cell datepicker_day datepicker_weekEndOut";
							} else {
								source.className = "datepicker_cell datepicker_day datepicker_currMonthOut";
							}
						} else {
							source.className = "datepicker_cell datepicker_day datepicker_otherMonthOut";
						}
					};
					cell.onmousedown = function(evt) {
						var source = (window.event ? window.event.srcElement : evt.target);
						var year = parseInt(datepicker_yearInput.value);
						var month = parseInt(datepicker_monthSelect.value);
						switch (source.date_picker_month)
						{
							case "prevMonth":
								if (month > 1) {
									month--;
								} else {
									month = 12;
									year--;
								}
								break;
							case "nextMonth":
								if (month < 12) {
									month++;
								} else {
									month = 1;
									year++;
								}
								break;
						}
						datepicker_return(year + "-" + datepicker_format(month, 2) + "-" + datepicker_format(parseInt(source.innerHTML), 2));
					};
				}
			}
		}
		
		tableBack = document.createElement("table");
		tableBack.className = "datepicker_table";
		datepicker_backDiv.appendChild(tableBack);
		
		tableBody = document.createElement("tbody");
		tableBack.appendChild(tableBody);
		
		rowBack = tableBody.insertRow(0);
		cell = rowBack.insertCell(0);
		
		buttonInput = document.createElement("input");
		buttonInput.type = "button";
		buttonInput.value = "清空日期";
		buttonInput.id = "datepicker_buttonLeft";
		buttonInput.onmousedown = datepicker_returnEmpty;
		cell.appendChild(buttonInput);
		
		cell = rowBack.insertCell(1);
		
		datepicker_today = document.createElement("input");
		datepicker_today.type = "button";
		datepicker_today.value = "今天：";
		datepicker_today.id = "datepicker_buttonRight";
		datepicker_today.onmousedown = datepicker_returnToday;
		cell.appendChild(datepicker_today);
	};
	
	function datepicker_return(value)
	{
		if (datepicker_timeoutId != null) {
			clearTimeout(datepicker_timeoutId);
		}
		datepicker_currObj.value = value;
		datepicker_currObj.focus();
		datepicker_hide();
	};

	function datepicker_hide()
	{
		datepicker_backDiv.style.display = "none";
		datepicker_currObj = null;
		datepicker_timeoutId = null;
	};

	function datepicker_blur()
	{
		if ((datepicker_backDiv != null) && (datepicker_currObj != null)) {
			if (datepicker_timeoutId != null) {
				clearTimeout(datepicker_timeoutId);
			}
			datepicker_timeoutId = setTimeout(datepicker_hide, 150);
		}
	};

	function datepicker_focus()
	{
		if (datepicker_timeoutId != null) {
			clearTimeout(datepicker_timeoutId);
			datepicker_timeoutId = null;
		}
	};
	
	function datepicker_compute_offsetTop(target)
	{
		var offsetTop = target.offsetTop;
		var parent = target.offsetParent;
		while (parent != null) {
			offsetTop += parent.offsetTop;
			parent = parent.offsetParent;
		}
		return offsetTop;
	};
	
	function datepicker_compute_offsetLeft(target)
	{
		var offsetLeft = target.offsetLeft;
		var parent = target.offsetParent;
		while (parent != null) {
			offsetLeft += parent.offsetLeft;
			parent = parent.offsetParent;
		}
		return offsetLeft;
	};
	
	// 按len把v数字之前补足零
	function datepicker_format(v, len)
	{
		var result = "" + v;
		len = len - result.length;
		while (len > 0) {
			result = "0" + result;
			len--;
		}
		return result;
	};
	
	function datepicker_compute_parseInt(v)
	{
		return (v.length > 0 ? parseInt(v, 10) : 0);
	};

	this.set_zIndex = function(zIndex)
	{
		datepicker_zIndex = zIndex;
	};

	// 弹出窗口默认位于input对象的下面。可用adjustX, adjustY调整其位置。
	// 不给readonly值时自动设置对象的readonly属性为true，可以给false来避免该设置。
	// 建议在load时调用。可以注册多个对象
	this.register = function(target, adjustX, adjustY, readonly)
	{
		if (datepicker_backDiv == null) {
			datepicker_createTable();
			datepicker_backDiv.style.display = "none";
		}
		if ((typeof(readonly) == "undefined") || (readonly == null) || !!readonly) {
			target.readOnly = "readonly";
		}
		if ((typeof(adjustX) == "undefined") || (adjustX == null)) {
			adjustX = 0;
		}
		if ((typeof(adjustY) == "undefined") || (adjustY == null)) {
			adjustY = 0;
		}
		target.onclick = function() {
			if (datepicker_backDiv != null) {
				datepicker_currObj = target;
				var curr = datepicker_currObj.value;
				var now = new Date();
				var year = now.getFullYear();
				var month = now.getMonth() + 1;
				datepicker_today.value = "今天：" + datepicker_now(now);
				
				if ((typeof(curr) == "undefined") || (curr == null)) {
					datepicker_reset(year, month);
				} else {
					var first = curr.indexOf("-");
					if (first > 0) {
						year = datepicker_compute_parseInt(curr.substring(0, first));
						first++;
						var second = curr.indexOf("-", first);
						if (second > 0){
							datepicker_reset(year, datepicker_compute_parseInt(curr.substring(first, second)));
						} else {
							datepicker_reset(year, month);
						}
					} else {
						datepicker_reset(year, month);
					}
				}

				if (datepicker_zIndex > -1){
					datepicker_backDiv.style.zIndex = datepicker_zIndex;
				}
				datepicker_backDiv.style.display = "";
				datepicker_backDiv.style.top = (datepicker_compute_offsetTop(datepicker_currObj)
					+ datepicker_currObj.offsetHeight + adjustY) + "px";
				datepicker_backDiv.style.left = (datepicker_compute_offsetLeft(datepicker_currObj)
					+ adjustX) + "px";
				datepicker_monthSelect.focus();
			}
		};
	};
	
	// 全部清除。一但释放后，如想再次使用，必须重新register
	this.release = function()
	{
		if (datepicker_backDiv != null){
			datepicker_backDiv.style.display = "none";
			datepicker_yearInput = null;
			datepicker_monthSelect = null;
			datepicker_today = null;
			datepicker_tableBody = null;
			datepicker_currObj = null;
			datepicker_timeoutId = null;
			datepicker_zIndex = -1;
			document.body.removeChild(datepicker_backDiv);
			datepicker_backDiv = null;
		}
	};
	
};
