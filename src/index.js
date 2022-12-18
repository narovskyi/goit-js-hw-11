import axios from "axios";
import { Notify } from "notiflix";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const refs = {
    gallery: document.querySelector('.gallery'),
    searchForm: document.querySelector('#search-form'),
    inputField: document.querySelector('.input-field'),
    loadMoreBtn: document.querySelector('.load-more-btn')
}
let pageNumber = 1;
let searchString = '';
let lightbox = null;

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreButtonClick);

async function onFormSubmit(e) {
    e.preventDefault();
    hideButton(refs.loadMoreBtn);
    clearGallery();
    pageNumber = 1;
    searchString = refs.inputField.value;
    if (refs.inputField.value.trim() === '') {
        return;
    }
    const objectOfPhotos = await getPhotos(searchString);
    const arrayOfPhotos = objectOfPhotos.hits;

    if (arrayOfPhotos.length === 0) {
        Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        return;
    }
    Notify.success(`Hooray! We found ${objectOfPhotos.totalHits} images.`);
    showButton(refs.loadMoreBtn);
    renderGalleryCards(arrayOfPhotos);
    lightbox = new SimpleLightbox('.gallery a', {
        captions: true,
        captionPosition: 'bottom'
    });
}

async function onLoadMoreButtonClick() {
    try {
        hideButton(refs.loadMoreBtn);
        pageNumber += 1;
        const objectOfPhotos = await getPhotos(searchString);
        const arrayOfPhotos = objectOfPhotos.hits;
        if (arrayOfPhotos.length === 0) {
            Notify.failure("We're sorry, but you've reached the end of search results.");
            return;
        }
        renderGalleryCards(arrayOfPhotos);
        lightbox.refresh();
        showButton(refs.loadMoreBtn);
    } catch (error) {
        Notify.failure("We're sorry, but you've reached the end of search results.");
    }
}

async function getPhotos (searchString) {
    const response = await axios.get('https://pixabay.com/api', {
        params: {
            key: '32074254-ec575441b41af33a027107547',
            q: `${searchString}`,
            image_type: 'photo',
            orientation: 'horizontal',
            safesearch: 'true',
            per_page: 40,
            page: pageNumber,
        }
    });
    return response.data;
}

function renderGalleryCards(arr) {
    const markupArr = arr.map(el => {
        return `
        <div class="gallery__item">
            <a class="gallery__link" href="${el.largeImageURL}">
                <img
                    class="gallery__image"
                    src="${el.webformatURL}"
                    alt="${el.tags}"
                    loading="lazy"
                    title="Likes: ${el.likes} | Views: ${el.views} | Comments: ${el.comments} | Downloads: ${el.downloads}"
                />
            </a>
        </div>
        `;
    }).join('');
    refs.gallery.insertAdjacentHTML('beforeend', markupArr);
}

function clearGallery() {
    refs.gallery.innerHTML = '';
}

function showButton(btn) {
    btn.removeAttribute('hidden');
}

function hideButton(btn) {
    btn.setAttribute('hidden', '');
}