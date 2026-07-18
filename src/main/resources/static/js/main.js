const VOTED_KEY = "voted_post_ids";
function getVotedPostIds() {
    try {
        return JSON.parse(localStorage.getItem(VOTED_KEY)) || [];
    } catch {
        return [];
    }
}
function addVotedPostId(id) {
    const ids = getVotedPostIds();
    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(VOTED_KEY, JSON.stringify(ids));
    }
}

let autoTransitionTimeout = null;

function startAutoTransitionTimer() {
    if (autoTransitionTimeout) clearTimeout(autoTransitionTimeout);
    autoTransitionTimeout = setTimeout(() => {
        nextCard();
    }, 10000);
}

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
        const url = `/posts?page=${page}&size=${size}&category=${currentCategory}&sortBy=${currentSort}&status=${currentStatus}`;
        const response = await fetch(url);
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
        console.error("Fetch error:", error);
    } finally {
        isFetching = false;
    }
}

async function castVote(postId, choice) {
    try {
        const response = await fetch(`/posts/${postId}/vote`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(choice)
        });
        
        if (response.ok) {
            showFeedback('선택 완료');
            startAutoTransitionTimer();
        } else {
            showFeedback('선택 완료');
            startAutoTransitionTimer();
        }
    } catch (error) {
        console.error("Vote error:", error);
        showFeedback('선택 완료');
        startAutoTransitionTimer();
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
    
    // Check if user already voted
    const votedIds = getVotedPostIds();
    const isVoted = votedIds.includes(post.id) || post.voted;
    
    let actionsHtml = '';
    if (isVoted) {
        const total = (post.agreeCount || 0) + (post.disagreeCount || 0);
        const agreePercent = total > 0 ? Math.round(((post.agreeCount || 0) / total) * 100) : 50;
        const disagreePercent = total > 0 ? 100 - agreePercent : 50;
        actionsHtml = `
            <div class="vote-results-container">
                <div class="results-stats">
                    <span class="stat-agree">👍 찬성 ${agreePercent}% (${post.agreeCount || 0}표)</span>
                    <span class="stat-disagree">👎 반대 ${disagreePercent}% (${post.disagreeCount || 0}표)</span>
                </div>
                <div class="progress-bar-wrapper">
                    <div class="progress-bar-fill" style="width: ${agreePercent}%;"></div>
                </div>
                <div class="auto-next-hint">이전에 투표를 마친 질문입니다.</div>
            </div>
        `;
    } else {
        actionsHtml = `
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
        `;
    }

    card.innerHTML = `
        <div class="status-badge ${isEnded ? 'status-ended' : 'status-ongoing'}">
            ${isEnded ? '종료됨' : '진행중'}
        </div>
        <div class="meta">${post.category} • ${new Date(post.createdDate).toLocaleDateString()}</div>
        <div class="question">${post.question}</div>
        <div class="actions" id="actions-${post.id}">
            ${actionsHtml}
        </div>
        <div class="end-date-info">종료 일자: ${post.endDate.replace(/-/g, '.')}</div>
    `;

    cardStack.appendChild(card);
    
    // Check if we need to fetch more
    if (currentIndex >= posts.length - 2) {
        fetchPosts();
    }

    updateNavButtons();
}

function handleVote(choice) {
    const post = posts[currentIndex];
    
    // Locally increment counts for immediate response
    if (choice) {
        post.agreeCount = (post.agreeCount || 0) + 1;
    } else {
        post.disagreeCount = (post.disagreeCount || 0) + 1;
    }
    post.voted = true;
    
    showVoteResultsOnCard(post);
    castVote(post.id, choice);
}

function showVoteResultsOnCard(post) {
    const actionsContainer = document.getElementById(`actions-${post.id}`);
    if (!actionsContainer) return;
    
    const total = (post.agreeCount || 0) + (post.disagreeCount || 0);
    const agreePercent = total > 0 ? Math.round(((post.agreeCount || 0) / total) * 100) : 50;
    const disagreePercent = total > 0 ? 100 - agreePercent : 50;
    
    addVotedPostId(post.id);
    
    actionsContainer.innerHTML = `
        <div class="vote-results-container">
            <div class="results-stats">
                <span class="stat-agree">👍 찬성 ${agreePercent}% (${post.agreeCount}표)</span>
                <span class="stat-disagree">👎 반대 ${disagreePercent}% (${post.disagreeCount}표)</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width: 0%;"></div>
            </div>
            <div class="auto-next-hint">10초 후 다음 질문으로 이동합니다...</div>
        </div>
    `;
    
    setTimeout(() => {
        const fill = actionsContainer.querySelector('.progress-bar-fill');
        if (fill) fill.style.width = `${agreePercent}%`;
    }, 50);
}

function nextCard() {
    if (autoTransitionTimeout) {
        clearTimeout(autoTransitionTimeout);
        autoTransitionTimeout = null;
    }
    if (currentIndex < posts.length - 1) {
        currentIndex++;
        const card = document.querySelector('.vote-card');
        if (card) {
            card.style.transform = 'translateX(-120%) rotate(-10deg)';
            card.style.opacity = '0';
        }
        setTimeout(renderCard, 300);
    }
}

function prevCard() {
    if (autoTransitionTimeout) {
        clearTimeout(autoTransitionTimeout);
        autoTransitionTimeout = null;
    }
    if (currentIndex > 0) {
        currentIndex--;
        const card = document.querySelector('.vote-card');
        if (card) {
            card.style.transform = 'translateX(120%) rotate(10deg)';
            card.style.opacity = '0';
        }
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
