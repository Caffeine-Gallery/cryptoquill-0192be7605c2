import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Load initial posts
    await loadPosts();

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showNewPostForm);
    document.getElementById('submitPost').addEventListener('click', handleSubmitPost);
    document.getElementById('cancelPost').addEventListener('click', hideNewPostForm);
});

async function loadPosts() {
    try {
        const posts = await backend.getPosts();
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post';
    
    const date = new Date(Number(post.timestamp / 1000000n)); // Convert nanoseconds to milliseconds
    
    article.innerHTML = `
        <h2 class="post-title">${post.title}</h2>
        <div class="post-meta">
            By ${post.author} • ${date.toLocaleDateString()}
        </div>
        <div class="post-content">
            ${post.body}
        </div>
    `;
    
    return article;
}

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
    quill.setContents([{ insert: '\n' }]);
    document.getElementById('postTitle').value = '';
    document.getElementById('authorName').value = '';
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
}

async function handleSubmitPost() {
    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('authorName').value;
    const body = quill.root.innerHTML;

    if (!title || !author || !body) {
        alert('Please fill in all fields');
        return;
    }

    try {
        await backend.createPost(title, body, author);
        hideNewPostForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    }
}
