$(document).ready(function() {
    // 今日の日付を取得して「来店日」フィールドの初期値に設定
    const today = new Date().toISOString().split('T')[0];
    $('#visit-date').val(today);
});

// マップとマーカーを管理するための変数
let map;
let marker;

// マップを初期化する関数
function initMap() {
    // 地図エリアを非表示に設定（最初は非表示にしておく）
    document.getElementById('map').style.display = 'none';
}

// 「この店の位置を保存」ボタンがクリックされたときの処理
document.getElementById('savemap').addEventListener('click', () => {
    if (navigator.geolocation) {
        // 位置情報を取得
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,  // 緯度
                    lng: position.coords.longitude, // 経度
                };

                // 地図エリアを表示する
                document.getElementById('map').style.display = 'block';

                // マップが未初期化の場合のみ新たに作成
                if (!map) {
                    map = new google.maps.Map(document.getElementById('map'), {
                        center: pos, // 位置情報を中心に設定
                        zoom: 15,    // ズームレベル
                    });
                } else {
                    // 既にマップがある場合は中心位置のみ更新
                    map.setCenter(pos);
                }

                // 既存のマーカーがあれば削除
                if (marker) {
                    marker.setMap(null);
                }

                // 新しいマーカーを現在位置に追加
                marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: '現在地', // マーカーのツールチップ
                });

                // 位置情報を保存関数に渡す
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
    currentImageData = imageData; // 画像データを変数に保存
}

// ファイル入力が変更されたときのイベントリスナー
document.getElementById('img').addEventListener('change', function(event) {
    const file = event.target.files[0]; // 選択されたファイルを取得
    if (file) {
        const reader = new FileReader(); // ファイルリーダーを作成
        reader.onload = function(e) {
            const preview = document.getElementById('preview');
            preview.src = e.target.result; // プレビューに画像を表示
            preview.style.display = 'block'; // プレビューを表示
            saveImageData(e.target.result); // 画像データを保存
        };
        reader.readAsDataURL(file); // 画像ファイルを読み込み
    }
});

// 位置情報と画像データをlocalStorageに保存する関数
function saveLocation(position) {
    const shopName = document.getElementById('shop-name').value.trim(); // 店名を取得
    const visitDate = document.getElementById('visit-date').value; // 来店日を取得

    // 店名と来店日が入力されているかを確認
    if (!shopName || !visitDate) {
        alert('店名と来店日を入力してください。');
        return;
    }

    // 画像が選択されているかを確認
    if (!currentImageData) {
        alert('画像を選択してください。');
        return;
    }

    // キーを「来店日_店名」に設定
    const key = `${visitDate}_${shopName}`;
    // 保存するデータをJSON形式の文字列に変換
    const value = JSON.stringify({ mapData: position, image: currentImageData });

    // localStorageに保存
    localStorage.setItem(key, value);

    // 画面に表示するためのHTMLを組み立て
    const html = `
        <li>
            <p>${visitDate} - ${shopName}</p>
            <p>地図データ: 緯度 ${position.lat}, 経度 ${position.lng}</p>
            <img src="${currentImageData}" alt="画像プレビュー">
        </li>
    `;
    $("#list").append(html); // データを画面のリストに追加
}

// セーブボタンのクリックイベント
$("#save").on("click", function() {
    const shopName = $("#shop-name").val(); // 店名を取得
    const date = $("#visit-date").val(); // 日付を取得
    const mapData = marker && marker.getPosition() ? JSON.stringify(marker.getPosition().toJSON()) : null;

// 位置情報を文字列に変換
    const imageData = $("#preview").attr("src"); // 画像のURLを取得

    const key = `${date}_${shopName}`; // キーを生成
    const value = JSON.stringify({ mapData: mapData, image: imageData }); // JSON形式で値を作成
    localStorage.setItem(key, value); // localStorageに保存

    // 画面に表示するためのHTMLを作成
    const html = `
        <li>
            <p>${key}</p>
            <p>${value}</p>
        </li>
    `;
    $("#list").append(html); // 表示リストに追加
});

// クリアボタンのクリックイベント
$("#clear").on("click", function() {
    $("#visit-date").val(""); // 来店日をクリア
    $("#shop-name").val(""); // 店名をクリア
    $("#preview").attr("src", ""); // プレビュー画像をクリア
    localStorage.clear(); // localStorageの内容を全て削除
    $("#list").empty(); // 表示リストをクリア
});

// ページ読み込み時に保存データを取得して表示
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i); // localStorageのキーを取得
    const { mapData, image } = JSON.parse(localStorage.getItem(key)); // データをパースして取得
    const [date, shopName] = key.split("_"); // キーを日付と店名に分割

    // 表示用HTMLを組み立て
    const html = `
        <li>
            <p>${date} - ${shopName}</p>
            <p>地図データ: 緯度 ${mapData.lat}, 経度 ${mapData.lng}</p>
            <img src="${image}" alt="画像プレビュー">
        </li>
    `;
    $("#list").append(html); // リストに追加して表示
}

// 画像選択後にプレビュー表示
$("#img").on("change", function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        $("#preview").attr("src", e.target.result); // プレビュー画像のsrcを設定
    };
    reader.readAsDataURL(file); // ファイルをData URL形式で読み込む
});
