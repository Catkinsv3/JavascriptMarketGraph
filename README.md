# Real-Time Cryptocurrency Market Graph

[This project is incomplete]

Interfacing with the Binance API via websocket, using AJAX.
Displays updating k-lines and volume data via Google Charts API.

NOTE: The interval is set to 1 minute. The active k-line will update several times before it settles at the end of the minute. New k-lines are added at the end of each minute.

Example JSON k-line response from Binance.

    "e": "kline",            // Event type
    "E": 1531729092845,      // Event time
    "s": "ETHUSDT",          // Symbol
    "k": {
        "t": 1531729080000,      // Start time: Klines are uniquely identified by their start time.
        "T": 1531729139999,      // Kline close time
        "s": "ETHUSDT",          // Symbol
        "i": "1m",               // Interval
        "f": 31524951,           // First trade ID
        "L": 31524962,           // Last trade ID
        "o": "452.13000000",     // Open price
        "c": "452.22000000",     // Close price
        "h": "452.23000000",     // High price
        "l": "452.11000000",     // Low price
        "v": "4.42800000",       // Base asset volume
                                    Base refers to ETH, quote refers to USDT in ETH/USDT.
                                    This figure is the total volume.
Kline.v - kline.V = sell volume.<br>
"n": 12,                 // Number of trades<br>
"x": false,              // Is this kline closed?<br>
"q": "2002.03666920",    // Quote asset volume<br>
"V": "2.99305000",       // Taker buy base asset volume<br>
This is buy volume<br>
"Q": "1353.25272570",    // Taker buy quote asset volume<br>
"B": "0"                 // Ignore<br>
}
}