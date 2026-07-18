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
            // Optional: Show success feedback
            showFeedback(choice ? 'Agreed!' : 'Disagreed!');
            // Move to next card after a short delay
            setTimeout(nextCard, 800);
        } else {
            const errorText = await response.text();
            alert(errorText || "Vote failed. Maybe rate limited?");
        }
    } catch (error) {
        console.error("Vote error:", error);
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
    
    // Check if we need to fetch more
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
