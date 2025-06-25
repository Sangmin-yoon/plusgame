// 게임 상태 변수
let gameState = {
    currentProblem: null,
    currentAnswer: null,
    score: 0,
    timer: null,
    timeLeft: 5000, // 5초 (밀리초)
    isGameActive: false
};

// 오디오 요소들
const sounds = {
    success: document.getElementById('success-sound'),
    fail: document.getElementById('fail-sound'),
    complete: document.getElementById('complete-sound')
};

// 화면 요소들
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen'),
    success: document.getElementById('success-screen')
};

// DOM 요소들
const elements = {
    score: document.getElementById('score'),
    problem: document.getElementById('problem'),
    answerInput: document.getElementById('answer-input'),
    timerBar: document.getElementById('timer-bar'),
    resultMessage: document.getElementById('result-message'),
    flyingImage: document.getElementById('flying-image'),
    couponDate: document.getElementById('coupon-date'),
    confetti: document.getElementById('confetti')
};

// 화면 전환 함수
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenName].classList.add('active');
}

// 게임 시작
function startGame() {
    gameState.score = 0;
    gameState.isGameActive = true;
    updateScore();
    showScreen('game');
    generateNewProblem();
}

// 새 문제 생성
function generateNewProblem() {
    const num1 = Math.floor(Math.random() * 41) + 10; // 10-50
    const num2 = Math.floor(Math.random() * 41) + 10; // 10-50
    
    gameState.currentProblem = `${num1} + ${num2}`;
    gameState.currentAnswer = num1 + num2;
    
    elements.problem.textContent = `${gameState.currentProblem} = ?`;
    elements.answerInput.value = '';
    
    startTimer();
}

// 타이머 시작
function startTimer() {
    gameState.timeLeft = 5000;
    elements.timerBar.style.width = '100%';
    elements.timerBar.className = 'timer-bar';
    
    const startTime = Date.now();
    
    gameState.timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        gameState.timeLeft = Math.max(0, 5000 - elapsed);
        
        const percentage = (gameState.timeLeft / 5000) * 100;
        elements.timerBar.style.width = percentage + '%';
        
        // 타이머 색상 변경
        if (percentage <= 20) {
            elements.timerBar.className = 'timer-bar danger';
        } else if (percentage <= 50) {
            elements.timerBar.className = 'timer-bar warning';
        }
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeUp();
        }
    }, 50);
}

// 시간 초과 처리
function timeUp() {
    if (!gameState.isGameActive) return;
    
    gameState.isGameActive = false;
    showResult(false, '⏰ 시간 초과!');
}

// 숫자 입력
function inputNumber(num) {
    if (!gameState.isGameActive) return;
    
    const currentValue = elements.answerInput.value;
    if (currentValue.length < 3) { // 최대 3자리 제한
        elements.answerInput.value = currentValue + num;
    }
}

// 입력 지우기
function clearInput() {
    if (!gameState.isGameActive) return;
    elements.answerInput.value = '';
}

// 한 글자 삭제
function deleteNumber() {
    if (!gameState.isGameActive) return;
    const currentValue = elements.answerInput.value;
    elements.answerInput.value = currentValue.slice(0, -1);
}

// 답안 제출
function submitAnswer() {
    if (!gameState.isGameActive) return;
    
    const userAnswer = parseInt(elements.answerInput.value);
    
    if (isNaN(userAnswer)) {
        return; // 빈 입력은 무시
    }
    
    gameState.isGameActive = false;
    clearInterval(gameState.timer);
    
    if (userAnswer === gameState.currentAnswer) {
        // 정답
        gameState.score++;
        updateScore();
        
        if (gameState.score >= 3) {
            // 3문제 연속 정답 - 게임 완료
            showCompleteScreen();
        } else {
            // 다음 문제로
            showResult(true, '🎯 정답입니다!');
        }
    } else {
        // 오답
        showResult(false, '❌ 틀렸습니다!');
    }
}

// 점수 업데이트
function updateScore() {
    elements.score.textContent = gameState.score;
}

// 결과 표시
function showResult(isCorrect, message) {
    if (isCorrect) {
        // 성공 효과음
        playSound('success');
        
        // 게임 화면에서 성공 메시지 잠깐 표시
        showSuccessMessage(message);
        
        // 1.5초 후 다음 문제
        setTimeout(() => {
            gameState.isGameActive = true;
            generateNewProblem();
        }, 1500);
    } else {
        // 실패 시에만 결과 화면에서 대기
        elements.resultMessage.textContent = message;
        elements.resultMessage.className = 'result-message fail';
        
        // 실패 효과음과 이미지 애니메이션
        playSound('fail');
        elements.flyingImage.style.animation = 'flyAcross 4s ease-in-out';
        
        // 애니메이션 후 리셋
        setTimeout(() => {
            elements.flyingImage.style.animation = '';
        }, 4000);
        
        showScreen('result');
    }
}

// 게임 화면에서 성공 메시지 표시
function showSuccessMessage(message) {
    // 성공 메시지 요소 생성
    const successDiv = document.createElement('div');
    successDiv.className = 'success-overlay';
    successDiv.innerHTML = `
        <div class="success-message-popup">
            <div class="success-text">${message}</div>
            <div class="success-score">연속 정답: ${gameState.score}/3</div>
        </div>
    `;
    
    // 게임 화면에 추가
    const gameScreen = document.getElementById('game-screen');
    gameScreen.appendChild(successDiv);
    
    // 1.5초 후 제거
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 1500);
}

// 게임 완료 (3문제 연속 정답)
function showCompleteScreen() {
    // 완료 효과음
    playSound('complete');
    
    // 현재 날짜 설정
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    elements.couponDate.textContent = dateStr;
    
    // 축포 애니메이션 생성
    createConfetti();
    
    showScreen('success');
}

// 축포 애니메이션 생성
function createConfetti() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            
            elements.confetti.appendChild(confetti);
            
            // 애니메이션 후 제거
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }, i * 100);
    }
}

// 효과음 재생
function playSound(soundName) {
    try {
        const sound = sounds[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.log('오디오 재생 실패:', e);
            });
        }
    } catch (error) {
        console.log('오디오 재생 오류:', error);
    }
}

// 쿠폰 저장 (Canvas를 이용한 이미지 다운로드)
function saveCoupon() {
    const canvas = document.getElementById('coupon-canvas');
    const ctx = canvas.getContext('2d');
    
    // 캔버스 크기 설정
    canvas.width = 400;
    canvas.height = 300;
    
    // 배경 그리기
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 300);
    
    // 테두리 그리기
    ctx.setLineDash([10, 5]);
    ctx.strokeStyle = '#ed8936';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 380, 280);
    
    // 헤더 배경
    ctx.setLineDash([]);
    ctx.fillStyle = '#ed8936';
    ctx.fillRect(10, 10, 380, 60);
    
    // 텍스트 스타일 설정
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('🥤 음료수 1잔 무료 쿠폰', 200, 45);
    
    // 게임 제목
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('🧮 더하기 빨리 계산하기! 🧮', 200, 120);
    
    // 달성 내용
    ctx.font = '16px Arial';
    ctx.fillText('3문제 연속 정답 달성', 200, 150);
    
    // 날짜
    ctx.fillStyle = '#718096';
    ctx.font = '14px Arial';
    const dateStr = new Date().toLocaleDateString('ko-KR');
    ctx.fillText(`발급일: ${dateStr}`, 200, 200);
    
    // 하단 텍스트
    ctx.font = '12px Arial';
    ctx.fillText('이 쿠폰을 제시하시면 음료수 1잔을 무료로 드립니다.', 200, 250);
    
    // 이미지 다운로드
    const link = document.createElement('a');
    link.download = `음료수쿠폰_${dateStr.replace(/\./g, '')}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// 게임 재시작
function restartGame() {
    gameState.score = 0;
    gameState.isGameActive = false;
    clearInterval(gameState.timer);
    updateScore();
    startGame();
}

// 홈으로 이동
function goHome() {
    gameState.score = 0;
    gameState.isGameActive = false;
    clearInterval(gameState.timer);
    updateScore();
    showScreen('start');
}

// 키보드 이벤트 처리
document.addEventListener('keydown', (e) => {
    if (!gameState.isGameActive) return;
    
    if (e.key >= '0' && e.key <= '9') {
        inputNumber(parseInt(e.key));
    } else if (e.key === 'Enter') {
        submitAnswer();
    } else if (e.key === 'Backspace') {
        deleteNumber();
    } else if (e.key === 'Escape') {
        clearInput();
    }
});

// 모바일 터치 이벤트 최적화
document.addEventListener('touchstart', function() {}, {passive: true});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 오디오 미리 로드
    Object.values(sounds).forEach(sound => {
        if (sound) {
            sound.load();
        }
    });
    
    // 시작 화면 표시
    showScreen('start');
}); 