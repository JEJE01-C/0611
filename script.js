// 시뮬레이션된 센서 데이터 생성
function generateSensorData() {
    return {
        temperature: (Math.random() * 10 + 20).toFixed(2), // 20-30°C
        humidity: (Math.random() * 40 + 30).toFixed(2),    // 30-70%
        pressure: (Math.random() * 20 + 1000).toFixed(2),  // 1000-1020hPa
        accel: {
            x: (Math.random() * 2 - 1).toFixed(4),  // -1 to 1
            y: (Math.random() * 2 - 1).toFixed(4),
            z: (Math.random() * 2 - 1).toFixed(4)
        },
        gyro: {
            x: (Math.random() * 6 - 3).toFixed(4),  // -3 to 3
            y: (Math.random() * 6 - 3).toFixed(4),
            z: (Math.random() * 6 - 3).toFixed(4)
        }
    };
}

// Firebase에서 모든 사용자 데이터 가져오기
async function fetchAllUsers() {
    const FIREBASE_BASE_URL = "https://commonpjt-fd9ed-default-rtdb.asia-southeast1.firebasedatabase.app/.json";

    try {
        const response = await fetch(FIREBASE_BASE_URL);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('사용자 데이터 가져오기 실패:', error);
        return null;
    }
}

// 사용자 목록 UI 업데이트
function updateUserList(allUsers) {
    const userListElement = document.getElementById('user-list');
    if (!allUsers) {
        userListElement.innerHTML = '<p>데이터를 불러올 수 없습니다.</p>';
        return;
    }

    const userNames = Object.keys(allUsers);
    const userListHTML = userNames.map(userName => {
        const userData = allUsers[userName];
        const lastUpdate = userData.sensehat ? 
            new Date(userData.sensehat.timestamp).toLocaleString('ko-KR') : 
            '데이터 없음';

        let sensorDataHTML = '';
        if (userData.sensehat) {
            sensorDataHTML = `
                <div class="user-sensors">
                    ${userData.info ? `<div class="sensor-row"><span class="sensor-label">학번</span> <span class="sensor-val">${userData.info.학번}</span></div>` : ''}
                    <div class="sensor-row">
                        <span class="sensor-label">온도</span> 
                        <span class="sensor-val">${userData.sensehat.temperature}°C</span>
                    </div>
                    <div class="sensor-row">
                        <span class="sensor-label">습도</span> 
                        <span class="sensor-val">${userData.sensehat.humidity}%</span>
                    </div>
                    <div class="sensor-row">
                        <span class="sensor-label">기압</span> 
                        <span class="sensor-val">${userData.sensehat.pressure}hPa</span>
                    </div>
                    <div class="sensor-row">
                        <span class="sensor-label">가속도</span> 
                        <span class="sensor-val">X: ${userData.sensehat.accel.x} / Y: ${userData.sensehat.accel.y} / Z: ${userData.sensehat.accel.z}</span>
                    </div>
                    <div class="sensor-row">
                        <span class="sensor-label">자이로</span> 
                        <span class="sensor-val">X: ${userData.sensehat.gyro.x} / Y: ${userData.sensehat.gyro.y} / Z: ${userData.sensehat.gyro.z}</span>
                    </div>
                </div>
            `;
        } else {
            sensorDataHTML = '<div class="no-data">센서 데이터가 없습니다</div>';
        }

        return `
            <div class="user-item">
                <div class="user-header">
                    <strong>${userName}</strong>
                </div>
                ${sensorDataHTML}
                <div class="user-update">최근 업데이트: ${lastUpdate}</div>
            </div>
        `;
    }).join('');

    userListElement.innerHTML = userListHTML;
}

// Firebase에 데이터 업로드
async function uploadToFirebase(data) {
    const FIREBASE_URL = "https://commonpjt-fd9ed-default-rtdb.asia-southeast1.firebasedatabase.app/박정은.json";

    const firebaseData = {
        info: {
            학번: "2024800007"
        },
        sensehat: {
            accel: data.accel,
            gyro: data.gyro,
            humidity: parseFloat(data.humidity),
            pressure: parseFloat(data.pressure),
            temperature: parseFloat(data.temperature),
            timestamp: new Date().toISOString()
        }
    };

    try {
        const response = await fetch(FIREBASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(firebaseData)
        });

        if (response.ok) {
            console.log('[업로드 완료] 상태 코드:', response.status);
            return true;
        } else {
            console.error('[업로드 실패] 상태 코드:', response.status);
            return false;
        }
    } catch (error) {
        console.error('[업로드 실패] 오류:', error);
        return false;
    }
}

// 메인 함수
async function updateSensorData() {
    const sensorData = generateSensorData();

    const uploadSuccess = await uploadToFirebase(sensorData);
    console.log(uploadSuccess ? '[업로드 완료] 상태 코드: 200' : '[업로드 실패]');

    // 모든 사용자 데이터 가져오기
    const allUsers = await fetchAllUsers();
    updateUserList(allUsers);

    document.getElementById('last-update').textContent = new Date().toLocaleString('ko-KR');
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    updateSensorData(); // 즉시 한 번 실행
    setInterval(updateSensorData, 5000); // 5초마다 업데이트
});