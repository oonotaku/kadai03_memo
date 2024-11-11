$(document).ready(function(){
    // 今日の日付を取得して初期値として設定
    const today = new Date().toISOString().split('T')[0];
    // ISO 形式はyy-mm-ddの形
    $('#visit-date').val(today);
});

let map;
let marker;

function initMap() {
    // 初期化時には地図を非表示にする
    document.getElementById('map').style.display = 'none';
}

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

function saveLocation(position) {
    const shopName = document.getElementById('shop-name').value;
    const visitDate = document.getElementById('visit-date').value;

    if (!shopName || !visitDate) {
        alert('店名と来店日を入力してください。');
        return;
    }

    const storeData = {
        name: shopName,
        date: visitDate,
        location: position,
    };

    // 既存のデータを取得
    const existingData = JSON.parse(localStorage.getItem('storeData')) || [];

    // 新しいデータを追加
    existingData.push(storeData);

    // 更新されたデータを保存
    localStorage.setItem('storeData', JSON.stringify(existingData));

    alert('現在地と情報を保存しました。');
}

        document.getElementById('img').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('preview');
                    preview.src = e.target.result;
                    preview.style.display = 'block'; // 画像を表示
                };
                reader.readAsDataURL(file);
            }
        });

// 画像データをBase64形式に変換する関数
function getImageBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}
