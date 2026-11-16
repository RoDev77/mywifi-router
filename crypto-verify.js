/*
 * Verifikasi pembayaran crypto (USDT/USDC) lewat RPC publik.
 * Mengembalikan Promise<{ ok:boolean, message:string, amount:number|null, token:string|null }>
 * Tidak ada kunci API berbayar yang dipakai di sini.
 */
(function (global) {
  'use strict';

  var TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  var RPC = {
    bnb: 'https://bsc-rpc.publicnode.com',
    eth: 'https://ethereum-rpc.publicnode.com',
    plasma: 'https://rpc.plasma.to'
  };
  var SOL_RPCS = [
    'https://solana-rpc.publicnode.com',
    'https://api.mainnet-beta.solana.com'
  ];
  var USDC_SOL = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
  var USDT_SOL = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';

  function result(ok, message, amount, token) {
    return { ok: !!ok, message: message, amount: amount == null ? null : amount, token: token || null };
  }
  function cleanHex(v) {
    return String(v || '').replace(/^0x/i, '').toLowerCase();
  }
  function addressFromTopic(topic) {
    return cleanHex(topic).slice(-40);
  }
  function fromWei(hex, decimals) {
    try { return Number(BigInt(hex || '0x0')) / Math.pow(10, decimals); }
    catch (e) { return NaN; }
  }
  function near(actual, expected) {
    if (!isFinite(actual) || !(expected > 0)) return false;
    return Math.abs(actual - expected) / expected <= 0.01;
  }
  function rpc(url, method, params) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params || [] })
    }).then(function (r) {
      if (!r.ok) throw new Error('RPC HTTP ' + r.status);
      return r.json();
    }).then(function (j) {
      if (j.error) throw new Error(j.error.message || 'RPC error');
      return j.result;
    });
  }
  function stringFromAbi(hex) {
    try {
      var raw = cleanHex(hex);
      if (raw.length < 128) return '';
      var offset = Number(BigInt('0x' + raw.slice(0, 64)));
      var start = offset * 2;
      var len = Number(BigInt('0x' + raw.slice(start, start + 64)));
      var dataHex = raw.slice(start + 64, start + 64 + len * 2);
      var out = '';
      for (var i = 0; i < dataHex.length; i += 2) out += String.fromCharCode(parseInt(dataHex.substr(i, 2), 16));
      return out;
    } catch (e) { return ''; }
  }
  function tokenInfo(rpcUrl, contract, block) {
    var at = block || 'latest';
    return Promise.all([
      rpc(rpcUrl, 'eth_call', [{ to: contract, data: '0x95d89b41' }, at]).then(stringFromAbi).catch(function () { return ''; }),
      rpc(rpcUrl, 'eth_call', [{ to: contract, data: '0x313ce567' }, at]).then(function (v) {
        try { return Number(BigInt(v)); } catch (e) { return 18; }
      }).catch(function () { return 18; })
    ]).then(function (a) { return { symbol: a[0], decimals: a[1] }; });
  }
  function verifyEvm(chain, txhash, expectedAmount, expectedAddress) {
    var url = RPC[chain];
    if (!url) return Promise.resolve(result(false, 'Jaringan tidak didukung.'));
    return rpc(url, 'eth_getTransactionReceipt', [txhash]).then(function (receipt) {
      if (!receipt) return result(false, 'Transaksi belum ditemukan / belum terkonfirmasi di jaringan.');
      if (receipt.status !== '0x1') return result(false, 'Transaksi gagal di jaringan (status bukan success).');
      var target = cleanHex(expectedAddress);
      var logs = (receipt.logs || []).filter(function (l) {
        return l.topics && cleanHex(l.topics[0]) === cleanHex(TRANSFER_TOPIC) &&
          addressFromTopic(l.topics[2]) === target;
      });
      if (!logs.length) return result(false, 'Tidak ada transfer token ke alamat pembayaran pada transaksi ini.');
      var log = logs[logs.length - 1];
      return tokenInfo(url, log.address, receipt.blockNumber).then(function (info) {
        var symbol = String(info.symbol || '').toUpperCase();
        if (symbol !== 'USDT' && symbol !== 'USDC') {
          return result(false, 'Token yang dikirim bukan USDT/USDC (terdeteksi: ' + (symbol || 'tidak dikenal') + ').');
        }
        var amount = fromWei(log.data, info.decimals);
        if (!near(amount, expectedAmount)) {
          return result(false, 'Nominal tidak sesuai. Diterima ' + amount.toFixed(6) + ' ' + symbol + ', seharusnya ' + expectedAmount.toFixed(6) + '.', amount, symbol);
        }
        return result(true, 'Pembayaran terverifikasi: ' + amount.toFixed(6) + ' ' + symbol + ' diterima.', amount, symbol);
      });
    }).catch(function (e) {
      return result(false, 'Gagal memeriksa transaksi: ' + e.message);
    });
  }

  var BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  function base58ToHex(str) {
    var n = 0n;
    for (var i = 0; i < str.length; i++) {
      var idx = BASE58.indexOf(str[i]);
      if (idx < 0) throw new Error('Alamat base58 tidak valid');
      n = n * 58n + BigInt(idx);
    }
    var hex = n.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    return hex;
  }
  function tronAddressToHex(addr) {
    var hex = base58ToHex(addr);
    // 21 byte: prefix 0x41 + 20 byte address
    return hex.slice(-40).toLowerCase();
  }
  function verifyTron(txhash, expectedAmount, expectedAddress) {
    return fetch('https://api.trongrid.io/v1/transactions/' + encodeURIComponent(txhash))
      .then(function (r) { if (!r.ok) throw new Error('TronGrid HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        if (!j || !j.length) return result(false, 'Transaksi belum ditemukan di jaringan Tron.');
        var t = j[0];
        if (!t.ret || !t.ret[0] || t.ret[0].contractRet !== 'SUCCESS') return result(false, 'Transaksi gagal di jaringan Tron.');
        var target = tronAddressToHex(expectedAddress);
        var logs = t.log || [];
        var hit = null;
        for (var i = 0; i < logs.length; i++) {
          var topics = logs[i].topics || [];
          if (cleanHex(topics[0]) === cleanHex(TRANSFER_TOPIC) && addressFromTopic(topics[2]) === target) { hit = logs[i]; break; }
        }
        if (!hit) return result(false, 'Tidak ada transfer TRC20 ke alamat pembayaran pada transaksi ini.');
        var amount = fromWei(hit.data, 6);
        if (!near(amount, expectedAmount)) return result(false, 'Nominal tidak sesuai. Diterima ' + amount.toFixed(6) + ', seharusnya ' + expectedAmount.toFixed(6) + '.', amount, 'TRC20');
        return result(true, 'Pembayaran terverifikasi: ' + amount.toFixed(6) + ' USDT/USDC (TRC20) diterima.', amount, 'TRC20');
      })
      .catch(function (e) { return result(false, 'Gagal memeriksa transaksi Tron: ' + e.message); });
  }

  function verifySolana(txhash, expectedAmount, expectedAddress) {
    var params = [txhash, {
      encoding: 'jsonParsed', commitment: 'confirmed', maxSupportedTransactionVersion: 1
    }];
    return rpc(SOL_RPCS[0], 'getTransaction', params)
      .catch(function () { return rpc(SOL_RPCS[1], 'getTransaction', params); })
      .then(function (tx) {
      if (!tx) return result(false, 'Transaksi belum ditemukan di jaringan Solana.');
      if (tx.meta && tx.meta.err) return result(false, 'Transaksi gagal di jaringan Solana.');
      var pre = (tx.meta && tx.meta.preTokenBalances) || [];
      var post = (tx.meta && tx.meta.postTokenBalances) || [];
      var expectedUnits = Math.round(expectedAmount * 1000000);
      var best = 0, token = null;
      post.forEach(function (p) {
        if (p.owner !== expectedAddress) return;
        if (p.mint !== USDC_SOL && p.mint !== USDT_SOL) return;
        var before = 0;
        pre.forEach(function (q) {
          if (q.accountIndex === p.accountIndex && q.mint === p.mint) before = Number(q.uiTokenAmount.amount) || 0;
        });
        var delta = (Number(p.uiTokenAmount.amount) || 0) - before;
        if (delta > best) { best = delta; token = p.mint === USDC_SOL ? 'USDC' : 'USDT'; }
      });
      if (!best) return result(false, 'Tidak ada penerimaan USDT/USDC ke alamat pembayaran pada transaksi ini.');
      var amount = best / 1000000;
      if (!near(amount, expectedAmount)) return result(false, 'Nominal tidak sesuai. Diterima ' + amount.toFixed(6) + ', seharusnya ' + expectedAmount.toFixed(6) + '.', amount, token);
      return result(true, 'Pembayaran terverifikasi: ' + amount.toFixed(6) + ' ' + token + ' diterima.', amount, token);
    }).catch(function (e) { return result(false, 'Gagal memeriksa transaksi Solana: ' + e.message); });
  }

  global.CryptoVerify = {
    verify: function (chain, txhash, expectedAmount, expectedAddress) {
      var hash = String(txhash || '').trim();
      if (!hash) return Promise.resolve(result(false, 'TxHash wajib diisi.'));
      if (!(expectedAmount > 0)) return Promise.resolve(result(false, 'Nominal tidak valid.'));
      if (chain === 'tron') return verifyTron(hash, expectedAmount, expectedAddress);
      if (chain === 'sol') return verifySolana(hash, expectedAmount, expectedAddress);
      if (RPC[chain]) return verifyEvm(chain, hash, expectedAmount, expectedAddress);
      return Promise.resolve(result(false, 'Jaringan tidak dikenal.'));
    },
    chains: ['bnb', 'tron', 'eth', 'plasma', 'sol']
  };
})(window);
