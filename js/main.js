$(document).ready(function() {
    // 今日の日付を取得して初期値として設定
    const today = new Date().toISOString().split('T')[0];
    $('#visit-date').val(today);
});

// マップとマーカーの変数を宣言
let map;
let marker;

// マップを初期化する関数
function initMap() {
    // 初期化時には地図を非表示にする
    document.getElementById('map').style.display = 'none';
}

// 「この店の位置を保存」ボタンがクリックされたときの処理
document.getElementById('savemap').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // 地図要素を表示
                document.getElementById('map').style.display = 'block';

                // マップが未初期化の場合、新たに作成
                if (!map) {
                    map = new google.maps.Map(document.getElementById('map'), {
                        center: pos,
                        zoom: 15,
                    });
                } else {
                    map.setCenter(pos);
                }

                // 既存のマーカーがあれば削除
                if (marker) {
                    marker.setMap(null);
                }

                // 新しいマーカーを追加
                marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: '現在地',
                });

                // 位置情報を保存
                saveLocation(pos);
            },
            () => {
                alert('位置情報の取得に失敗しました。');
            }
        );
    } else {
        alert('このブラウザは位置情報取得に対応していません。');
    }
});

// 画像データを一時的に保持する変数
let currentImageData = '';

// 画像データを保存する関数
function saveImageData(imageData) {
    currentImageData = imageData;
}

// ファイル入力が変更されたときのイベントリスナー
document.getElementById('img').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('preview');
            preview.src = e.target.result;
            preview.style.display = 'block'; // 画像を表示
            // 画像データを保存
            saveImageData(e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// 位置情報と画像データを保存する関数
function saveLocation(position) {
    const shopName = document.getElementById('shop-name').value.trim();
    const visitDate = document.getElementById('visit-date').value;

    if (!shopName || !visitDate) {
        alert('店名と来店日を入力してください。');
        return;
    }

    if (!currentImageData) {
        alert('画像を選択してください。');
        return;
    }

    // キーとして店名と来店日を組み合わせる
    const key = `${shopName}_${visitDate}`;
    const value  =`${currentImageData}`;

    // // 保存するデータ
    // const storeData = {
    //     location: position,
    //     image: currentImageData,
    // };

    // // データをlocalStorageに保存
    // localStorage.setItem(key, JSON.stringify(storeData));

    // alert('現在地と情報を保存しました。');
}
