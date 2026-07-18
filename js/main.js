const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (window.location.port === '8080' ? '' : 'http://localhost:8080')
    : 'https://vote-program-backend.onrender.com'; // <-- REPLACE with your actual deployed backend URL (Render, Railway, etc.)

// Client-side Mock Data Fallback when backend is not reachable/configured
const MOCK_FALLBACK_DATA = {
    content: [
        {
            id: 9991,
            category: "POLITICS",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
            question: "내년 대선, 어떤 후보를 더 지지하시나요?"
        },
        {
            id: 9992,
            category: "ENTERTAINMENT",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 15 * 86400000).toISOString(),
            question: "좋아하는 아이돌 그룹 컴백 콘서트 티켓 50만원 찬반"
        },
        {
            id: 9993,
            category: "ETC",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 86400000).toISOString(),
            question: "탕수육 부먹 vs 찍먹, 평생의 논쟁"
        },
        {
            id: 9994,
            category: "POLITICS",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 10 * 86400000).toISOString(),
            question: "주 4일 근무제 법제화 도입 찬반 투표"
        },
        {
            id: 9995,
            category: "ETC",
            createdDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 120 * 86400000).toISOString(),
            question: "평생 겨울만 살기 vs 평생 여름만 살기"
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
            showFeedback(choice ? 'Agreed!' : 'Disagreed!');
            setTimeout(nextCard, 800);
        } else {
            showFeedback(choice ? 'Agreed! (Mock)' : 'Disagreed! (Mock)');
            setTimeout(nextCard, 800);
        }
    } catch (error) {
        console.warn("Vote API error, simulating mock vote:", error);
        showFeedback(choice ? 'Agreed! (Mock)' : 'Disagreed! (Mock)');
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Agree
            </button>
            <button class="btn btn-disagree" onclick="handleVote(false)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                Disagree
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
    const feedback = document.createElement('div');
    feedback.style.position = 'absolute';
    feedback.style.top = '50%';
    feedback.style.left = '50%';
    feedback.style.transform = 'translate(-50%, -50%)';
    feedback.style.fontSize = '40px';
    feedback.style.fontWeight = '800';
    feedback.style.color = 'white';
    feedback.style.textShadow = '0 10px 20px rgba(0,0,0,0.5)';
    feedback.style.zIndex = '100';
    feedback.innerText = text;
    card.appendChild(feedback);
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
