

// TODO: Strong/moderate/weak buy signals based on buy:sell ratio.
// TODO: Limit graphs to 50 units, cutting off the tail.
// TODO: State machine indicating candlestick trends, then doji based on prior trend.
// TODO: RSI or averages?
// TODO: MySQL database integration?

// Load the Visualization API and the corechart package.
// Google does not allow you to download the google.charts.load js library.
google.charts.load('current', {'packages': ['corechart', 'bar']});

$(document).ready(function () {
    console.log('ready');

    let today, h, m, s, t, M, d, Y;
    const $time = $("#time");

    function startTime() {
        today = new Date();
        Y = today.getFullYear().toString().substr(-2);  // Gets last 2 digits of year.
        M = today.getMonth() + 1;  // Months are zero-indexed.
        d = today.getDate();
        h = today.getHours();
        m = today.getMinutes();
        s = today.getSeconds();
        M = checkTime(M);
        m = checkTime(m);
        s = checkTime(s);
        $time.html(d + "/" + M + "/" + Y + "<br>" + h + ":" + m + ":" + s);
        t = setTimeout(startTime, 500);
    }

    function checkTime(i) {
        if (i < 10) {
            i = "0" + i
        }  // add zero in front of numbers < 10

        return i;
    }

    startTime();

    let windowWidth, windowHeight;

    function reportDimensions() {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        return [windowWidth, windowHeight];
    }

    const log = $("#log");

    function logText(text) {
        log.append(text);
        log.scrollTop(log.prop("scrollHeight"));
    }

    $(window).resize(reportDimensions);

    google.charts.setOnLoadCallback(begin);

    const socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@kline_1m');
    socket.onopen = function (event) {
        logText("<br>Connected to: " + event.currentTarget.url);
    };
    socket.onerror = function (error) {
        logText("<br>WebSocket Error: " + error);
    };
    socket.onclose = function (event) {
        logText("<br>Disconnected from WebSocket: " + event);
    };
    $("#close").on("click", function (e) {
        e.preventDefault();
        socket.close();
        logText("<br>attempting close");
    });

    let volumeFlag;
    const volumeClass = $('#volume');

    function populateFlags(buys, sells) {
        volumeFlag = 2;
        if (sells > buys) {
            volumeFlag = -1;  // -1 = weak sell, -2 moderate sell, -3 = strong sell.
            volumeClass.html("Volume: <span style='color: #e97353'>SELL</span>");
        } else if (buys > sells) {
            volumeFlag = 1;  // 1 = weak buy, 2 = moderate buy, 3 = strong buy.
            volumeClass.html("Volume: <span style='color: #f8e18b'>BUY</span>");
        } else {
            volumeFlag = 0;  // 0 = wait.
            volumeClass.html("Volume: WAIT");
        }
    }

    let msgCounter = 0, message, parsed, pretty;
    const $kline = $("#kline");
    const $updatenum = $("#updatenum");

    function begin() {

        socket.onmessage = function (event) {
            message = event.data;

            msgCounter += 1;
            $updatenum.text(msgCounter);

            parsed = JSON.parse(message);
            updateCandlesticks(parsed);

            pretty = JSON.stringify(parsed, null, 2);
            $kline.text(pretty);
        };

        function drawIndi2() {
            let chart = new google.charts.Bar(document.getElementById('indi2_div'));

            chart.draw(data, google.charts.Bar.convertOptions(options));
        }

        const sticksArray = new google.visualization.DataTable();
        sticksArray.addColumn('datetime', 'Time');
        sticksArray.addColumn('number', 'Low');
        sticksArray.addColumn('number', 'Open');
        sticksArray.addColumn('number', 'Close');
        sticksArray.addColumn('number', 'High');
        sticksArray.addColumn({'type': 'string', 'role': 'tooltip'});

        const volumeArray = new google.visualization.DataTable();
        volumeArray.addColumn('datetime', 'Time');
        volumeArray.addColumn('number', 'Buys');
        volumeArray.addColumn('number', 'Sells');

        let kline, time, datetime, open, close, high, low, totalVolume, buyVolume, sellVolume;
        let prevTime = 0, currentCandleRowIndex = 0, dataBook = {};
        let month, day, hour, minute, candleTooltip, keyArray = [];

        const candlestickChart = new google.visualization.CandlestickChart(document.getElementById('candlestick_div'));
        const indi1Chart = new google.visualization.ColumnChart(document.getElementById('indi1_div'));

        const candlestickOptions = {
            legend: 'none',
            bar: {groupWidth: "90%"},
            backgroundColor: '#212121',
            colors: ['#f8e18b'],
            candlestick: {
                fallingColor: {fill: '#e97353', stroke: '#f8e18b', strokeWidth: 0},
                risingColor: {fill: '#f8e18b', stroke: '#f8e18b', strokeWidth: 0}
            },
            chartArea: {
                left: 0,
                top: 0,
                width: '100%',
                height: '100%'
            },
            vAxis: {
                textPosition: 'in',
                gridlines: {
                    count: 3,
                    color: '#212121'
                },
                textStyle: {
                    color: 'white',
                    fontName: 'Roboto',
                    fontSize: 12
                }
            },
            hAxis: {
                textPosition: 'in',
                format: 'hh:mm',
                gridlines: {
                    count: 6,
                    color: '#212121'
                },
                textStyle: {
                    color: 'white',
                    fontName: 'Roboto',
                    fontSize: 12
                }
            }
        };
        const indi1Options = {
            legend: {position: 'none'},
            bar: {groupWidth: "90%"},
            isStacked: true,
            focusTarget: 'category',
            backgroundColor: {
                stroke: '#212121',
                strokeWidth: 1,
                fill: '#212121'
            },
            colors: ['#f8e18b', '#e97353'],
            chartArea: {
                backgroundColor: '#212121',
                left: 0,
                top: 0,
                width: '100%',
                height: '90%'
            },
            vAxis: {
                textPosition: 'in',
                gridlines: {
                    count: 3,
                    color: '#212121'
                },
                textStyle: {
                    color: 'white',
                    fontName: 'Roboto',
                    fontSize: 12
                }
            },
            hAxis: {
                // textPosition: 'in',
                format: 'hh:mm',
                gridlines: {
                    count: 6,
                    color: '#212121'
                },
                textStyle: {
                    color: 'white',
                    fontName: 'Roboto',
                    fontSize: 12
                }
            }
        };

        function updateCandlesticks(data) {

            kline = data.k;

            time = kline.t;
            datetime = new Date(time);
            month = checkTime(datetime.getMonth());
            day = checkTime(datetime.getDay());
            hour = checkTime(datetime.getHours());
            minute = checkTime(datetime.getMinutes());

            open = parseFloat(kline.o);
            close = parseFloat(kline.c);
            high = parseFloat(kline.h);
            low = parseFloat(kline.l);

            totalVolume = parseFloat(kline.v);
            buyVolume = parseFloat(kline.V);
            sellVolume = totalVolume - buyVolume;

            dataBook[time] = [time, open, close, high, low, totalVolume, buyVolume, sellVolume];

            candleTooltip = hour + ":" + minute + "\nHigh: " + high + "\nOpen: " + open +
                "\n Close: " + close + "\nLow: " + low;

            if (time === prevTime) {
                sticksArray.removeRow(currentCandleRowIndex);
                volumeArray.removeRow(currentVolumeRowIndex);

                currentCandleRowIndex = sticksArray.addRow([datetime, high, open, close, low, candleTooltip]);
                currentVolumeRowIndex = volumeArray.addRow([datetime, buyVolume, sellVolume]);
                console.log(currentCandleRowIndex);
            } else {
                currentCandleRowIndex = sticksArray.addRow([datetime, high, open, close, low, candleTooltip]);
                currentVolumeRowIndex = volumeArray.addRow([datetime, buyVolume, sellVolume]);
                console.log(currentCandleRowIndex);

                prevData = dataBook[prevTime];
                if (typeof prevData !== 'undefined') {
                    populateFlags(prevData[6], prevData[7]);
                } else {
                    populateFlags(0, 0);
                }

                // if (keyArray.push(datetime) > 2) {
                //     sticksArray.removeRow(keyArray[0]);
                //     volumeArray.removeRow(keyArray[0]);
                // }

                if (currentCandleRowIndex > 9) {
                    sticksArray.removeRow(0);
                    currentCandleRowIndex -= 1;
                    volumeArray.removeRow(0);
                    currentVolumeRowIndex -= 1;
                }
            }
            prevTime = time;

            candlestickChart.draw(sticksArray, candlestickOptions);
            indi1Chart.draw(volumeArray, indi1Options);
        }
    }
});


//CORS disallows cross-server requests. Perhaps look into this: https://www.npmjs.com/package/binance
// $.ajax({
//     url: "https://api.binance.com/api/v1/time",
//     type: "GET",
//     dataType: "json",
//     headers: { "X-MBX-APIKEY": "faZVpFqAEIGLrzEwDqt1CsuvJXL1EOtRA1IBgI73kHUAMG1Yw2UikjrX5dsIc4hG" },
//     success: function (data) {
//         console.log(data)
//     }
// });