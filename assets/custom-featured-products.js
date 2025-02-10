function updateOptions(section) {
  section.querySelectorAll('.custom-featured__options').forEach((select) => {
    select.addEventListener('change', function (event) {
      const selectedVariantId = event.target.value;
      const productId = event.target.getAttribute('data-product-id');
      const selectedOption = event.target.querySelector(`option[value="${selectedVariantId}"]`);
      const selectedPrice = selectedOption.getAttribute('data-price');
      const storeCurrency = selectedOption.getAttribute('data-currency');

      const priceContainer = section.querySelector(`#product-price-${productId}`);
      priceContainer.textContent = storeCurrency + selectedPrice / 100;

      const button = section.querySelector(
        `.custom-featured__product[data-product-id="${productId}"] .custom-featured__add-to-cart--click`
      );

      button.setAttribute('data-variant-id', selectedVariantId);
    });
  });
}

function setChoosenCollectionqwe(section) {
  const collectionTitles = section.querySelectorAll('.custom-featured__collection');
  const productLists = section.querySelectorAll('.custom-featured__products');

  collectionTitles.forEach((title) => {
    title.addEventListener('click', function () {
      const collectionId = this.getAttribute('data-collection-id');

      collectionTitles.forEach((t) => t.classList.remove('custom-featured__collection--active'));
      productLists.forEach((list) => (list.style.display = 'none'));

      this.classList.add('custom-featured__collection--active');
      section.querySelector(`.custom-featured__products[data-collection-id="${collectionId}"]`).style.display =
        'flex';
    });
  });
}

function updateSwiper(section) {
  let timeRotate = section.getAttribute('data-time-rotate');
  let desktopItems = Number(section.getAttribute('data-desktop-items'));
  let tabletItems = Number(section.getAttribute('data-tablet-items'));
  let mobileItems = Number(section.getAttribute('data-mobile-items'));
  let auto_rotate = section.getAttribute('data-autorotate') === 'true';

  const swiperContainers = section.querySelectorAll('.swiper');

  if (!swiperContainers.length) return;

  swiperContainers.forEach((swiperContainer) => {
    let swiperIndex = swiperContainer.getAttribute('data-index');

    let totalSlides = swiperContainer.querySelectorAll('.swiper-slide').length;

    let prevEl = null;
    let nextEl = null;

    section.querySelectorAll('.swiper-button-prev').forEach((prev) => {
      if (prev.getAttribute('data-index') === swiperIndex) {
        prevEl = prev;
      }
    });

    section.querySelectorAll('.swiper-button-next').forEach((next) => {
      if (next.getAttribute('data-index') === swiperIndex) {
        nextEl = next;
      }
    });

    let actualDesktopItems = Math.min(desktopItems, totalSlides);
    let actualTabletItems = Math.min(tabletItems, totalSlides);
    let actualMobileItems = Math.min(mobileItems, totalSlides);

    const swiperConfig = {
      direction: 'horizontal',
      slidesPerView: actualDesktopItems,
      navigation: {
        prevEl: prevEl,
        nextEl: nextEl,
      },
      loop: totalSlides >= desktopItems * 2,
      breakpoints: {
        320: { slidesPerView: actualMobileItems },
        768: { slidesPerView: actualTabletItems },
        1024: { slidesPerView: actualDesktopItems },
      },
    };

    if (auto_rotate) {
      swiperConfig.autoplay = {
        delay: Number(timeRotate) * 1000,
        disableOnInteraction: false,
      };
    }

    new Swiper(swiperContainer, swiperConfig);
  });
}

function updateCart(section) {
  const addToCartButtons = section.querySelectorAll('.custom-featured__add-to-cart--click');

  addToCartButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const variantId = button.getAttribute('data-variant-id');
      const successMessage = button.closest('.custom-featured__add-to-cart').nextElementSibling;

      addToCart(variantId, button, successMessage);
    });
  });

  function addToCart(variantId, button, successMessage) {
    let formData = {
      items: [{ id: variantId, quantity: 1 }],
    };

    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then(() => {
        button.style.display = 'none';
        successMessage.style.display = 'block';

        setTimeout(() => {
          successMessage.style.display = 'none';
          button.style.display = 'inline-block';
        }, 5000);

        return fetch('/cart.js');
      })
      .then((response) => response.json())
      .then((cart) => {
        const cartBubble = document.querySelector('#cart-icon-bubble .cart-count-bubble span');

        if (cartBubble) {
          cartBubble.textContent = cart.item_count;
        } else if (cart.item_count > 0) {
          const cartIcon = document.querySelector('#cart-icon-bubble');
          if (cartIcon) {
            const bubble = document.createElement('div');
            bubble.classList.add('cart-count-bubble');
            bubble.innerHTML = `<span aria-hidden="true">${cart.item_count}</span><span class="visually-hidden">${cart.item_count} item</span>`;
            cartIcon.appendChild(bubble);
          }
        }
      })
      .catch((error) => console.error('Error:', error));
  }
}
