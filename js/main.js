const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '8080' ? '' : 'http://localhost:8080')
    : 'https://vote-program-backend.onrender.com'; // <-- REPLACE with your actual deployed backend URL (Render, Railway, etc.)

// Client-side Mock Data Fallback when backend is not reachable/configured
const MOCK_FALLBACK_DATA = {
    content: [
        // POLITICS
        {
            id: 9991,
            category: "POLITICS",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            question: "내년 대선 투표 기준:\n정책 보고 투표 (👍) vs 인물 보고 투표 (👎)"
        },
        {
            id: 9992,
            category: "POLITICS",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            question: "기본 소득제 도입:\n전 국민 지급 (👍) vs 취약 계층 집중 지급 (👎)"
        },
        {
            id: 9993,
            category: "POLITICS",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 45 * 86400000).toISOString(),
            question: "만 18세 선거 연령 제한:\n현행 유지 (👍) vs 만 16세로 추가 인하 (👎)"
        },
        {
            id: 9994,
            category: "POLITICS",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() - 2 * 86400000).toISOString(), // ended
            question: "국회의원 특권 폐지:\n찬성 및 폐지 (👍) vs 유지하되 책임 강화 (👎)"
        },
        {
            id: 9995,
            category: "POLITICS",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 10 * 86400000).toISOString(),
            question: "주 4일제 도입 시 임금 기준:\n임금 삭감 수용 (👍) vs 임금 보전 필수 (👎)"
        },

        // ENTERTAINMENT
        {
            id: 9996,
            category: "ENTERTAINMENT",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
            question: "좋아하는 가수의 콘서트 티켓팅:\n맨 앞 스탠딩 (👍) vs 편안한 지정석 (👎)"
        },
        {
            id: 9997,
            category: "ENTERTAINMENT",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 20 * 86400000).toISOString(),
            question: "아이돌 가수의 열애 공개:\n연애는 개인의 자유 (👍) vs 팬들에 대한 예의 부족 (👎)"
        },
        {
            id: 9998,
            category: "ENTERTAINMENT",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() - 5 * 86400000).toISOString(), // ended
            question: "좋아하는 예능 프로그램 유형:\n리얼 야외 버라이어티 (👍) vs 실내 스튜디오 토크쇼 (👎)"
        },
        {
            id: 9999,
            category: "ENTERTAINMENT",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 40 * 86400000).toISOString(),
            question: "드라마 시청 방식 선호도:\n매주 본방 사수 (👍) vs 한 번에 몰아보기 (👎)"
        },
        {
            id: 10000,
            category: "ENTERTAINMENT",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            question: "연예인 부캐(서브 캐릭터) 활동:\n참신하고 재밌다 (👍) vs 과도한 이미지 소비로 식상하다 (👎)"
        }
    ]
};

let posts = [];
let currentIndex = 0;
let currentCategory = "";
let currentSort = "latest";
let currentStatus = "";
let isFetching = false;
let page = 0;
const size = 10;

const cardStack = document.getElementById('cardStack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const categoryTabs = document.querySelectorAll('.category-tab');
const filterChips = document.querySelectorAll('.filter-chip');
const bottomTabs = document.querySelectorAll('.bottom-tab');

// --- API Calls ---

async function fetchPosts(reset = false) {
    if (isFetching) return;
    isFetching = true;

    if (reset) {
        page = 0;
        posts = [];
        currentIndex = 0;
        cardStack.innerHTML = '<div class="vote-card"><div class="question" style="font-size: 18px; color: var(--text-muted)">Loading...</div></div>';
    }

    try {
        const url = `${API_BASE}/posts?page=${page}&size=${size}&category=${currentCategory}&sortBy=${currentSort}&status=${currentStatus}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Server response not OK");
        const data = await response.json();
        
        if (data.content.length > 0) {
            if (reset) posts = [];
            posts = [...posts, ...data.content];
            page++;
            renderCard();
        } else if (reset) {
            cardStack.innerHTML = '<div class="vote-card"><div class="question" style="font-size: 18px; color: var(--text-muted)">No votes found.</div></div>';
            updateNavButtons();
        }
    } catch (error) {
        console.warn("Fetch error, falling back to local mock data:", error);
        if (reset) {
            posts = [...MOCK_FALLBACK_DATA.content];
            // Filter by category
            if (currentCategory) {
                posts = posts.filter(p => p.category === currentCategory);
            }
            currentIndex = 0;
            if (posts.length > 0) {
                renderCard();
            } else {
                cardStack.innerHTML = '<div class="vote-card"><div class="question" style="font-size: 18px; color: var(--text-muted)">No votes found (Mock).</div></div>';
                updateNavButtons();
            }
        }
    } finally {
        isFetching = false;
    }
}

async function castVote(postId, choice) {
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/vote`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(choice)
        });
        
        if (response.ok) {
            showFeedback('선택 완료');
            setTimeout(nextCard, 800);
        } else {
            showFeedback('선택 완료');
            setTimeout(nextCard, 800);
        }
    } catch (error) {
        console.warn("Vote API error, simulating mock vote:", error);
        showFeedback('선택 완료');
        setTimeout(nextCard, 800);
    }
}

// --- UI Logic ---

function renderCard() {
    if (posts.length === 0) return;
    
    const post = posts[currentIndex];
    cardStack.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(post.endDate);
    const isEnded = endDate < today;

    const card = document.createElement('div');
    card.className = 'vote-card';
    card.innerHTML = `
        <div class="status-badge ${isEnded ? 'status-ended' : 'status-ongoing'}">
            ${isEnded ? '종료됨' : '진행중'}
        </div>
        <div class="meta">${post.category} • ${new Date(post.createdDate).toLocaleDateString()}</div>
        <div class="question">${post.question}</div>
        <div class="actions">
            ${!isEnded ? `
            <button class="btn btn-agree" onclick="handleVote(true)">
                👍
            </button>
            <button class="btn btn-disagree" onclick="handleVote(false)">
                👎
            </button>
            ` : `
            <div style="text-align: center; color: var(--text-muted); padding: 20px; background: rgba(255,255,255,0.03); border-radius: 20px;">
                투표가 종료되었습니다.
            </div>
            `}
        </div>
        <div class="end-date-info">종료 일자: ${post.endDate.replace(/-/g, '.')}</div>
    `;

    cardStack.appendChild(card);
    
    if (currentIndex >= posts.length - 2) {
        fetchPosts();
    }

    updateNavButtons();
}

function handleVote(choice) {
    const post = posts[currentIndex];
    castVote(post.id, choice);
}

function nextCard() {
    if (currentIndex < posts.length - 1) {
        currentIndex++;
        const card = document.querySelector('.vote-card');
        card.style.transform = 'translateX(-120%) rotate(-10deg)';
        card.style.opacity = '0';
        setTimeout(renderCard, 300);
    }
}

// Prev Card
function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
        const card = document.querySelector('.vote-card');
        card.style.transform = 'translateX(120%) rotate(10deg)';
        card.style.opacity = '0';
        setTimeout(renderCard, 300);
    }
}

function updateNavButtons() {
    prevBtn.style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
    nextBtn.style.visibility = currentIndex === posts.length - 1 ? 'hidden' : 'visible';
}

function showFeedback(text) {
    const card = document.querySelector('.vote-card');
    if (!card) return;
    const feedback = document.createElement('div');
    feedback.style.position = 'absolute';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%) scale(0.6)';
    feedback.style.fontSize = '36px';
    feedback.style.fontWeight = '800';
    feedback.style.color = 'white';
    feedback.style.textShadow = '0 10px 25px rgba(0,0,0,0.6)';
    feedback.style.zIndex = '100';
    feedback.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    feedback.style.opacity = '0';
    feedback.style.pointerEvents = 'none';
    feedback.innerText = text;
    card.appendChild(feedback);

    // Animate in
    setTimeout(() => {
        feedback.style.transform = 'translate(-50%, -50%) scale(1.1)';
        feedback.style.opacity = '1';
    }, 10);

    // Animate out
    setTimeout(() => {
        feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';
        feedback.style.opacity = '0';
        setTimeout(() => {
            feedback.remove();
        }, 300);
    }, 500);
}

// --- Event Listeners ---

prevBtn.onclick = prevCard;
nextBtn.onclick = nextCard;

categoryTabs.forEach(tab => {
    tab.onclick = () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
        fetchPosts(true);
    };
});

filterChips.forEach(chip => {
    chip.onclick = () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentSort = chip.dataset.sort;
        fetchPosts(true);
    };
});

bottomTabs.forEach(tab => {
    tab.onclick = () => {
        bottomTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentStatus = tab.dataset.status;
        fetchPosts(true);
    };
});

// Initial Fetch
fetchPosts(true);
