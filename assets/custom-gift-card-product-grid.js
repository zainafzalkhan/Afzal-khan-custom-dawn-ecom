(function() {
    const popupBtns = document.querySelectorAll(".popup-button");
    //ADDON PRODUCT VARIANT ID;
    const softWinterBlackMVariant = "51557380620605";
    popupBtns.forEach(popupBtn => {
        const productId = popupBtn.dataset.productid;
        const modal = document.querySelector(`.modal-${productId}`);

        const atcButton = modal.querySelector(".atc-button")
        const selectedVariantInput = modal.querySelector("#selectedVariant");
        const successMsg = modal.querySelector(".success-with-atc");
        const errorMsg = modal.querySelector(".errors-atc")
        const productData = JSON.parse(
            modal.querySelector("#productData")?.textContent
        )
        // close btn event binding
        const modalCloseBtns = modal.querySelectorAll("[data-close]");
        modalCloseBtns.forEach(modalClose => {
            modalClose.addEventListener("click", () => {
                modal.style.display = 'none'
            })
        })

        // bind event on options
        let selectedOptions = {};
        productData.options.forEach(optionName => selectedOptions[optionName] = null)

        // Find desired variant of selected options
        const findVariant = () => {
            // go through every variant
            // for every variant we have options, and there's selectedOption for selected option values,

            const matchedVariant = productData.variants.find(variant => {
                const isEveryOptionMatched = productData.options.every((optionName, index) => {
                    const key = `option${index+1}`;
                    return variant[key] == selectedOptions[optionName];
                })
                return isEveryOptionMatched;
            })
            if (matchedVariant) {
                selectedVariantInput.value = matchedVariant.id;
            }
        }

        // btn event binding
        const btns = modal.querySelectorAll('.btn-option');
        btns.forEach(btn => {
            const clrName = btn.dataset.value.toLowerCase();
            btn.style.setProperty('--btn-color', clrName)
            btn.addEventListener("click", () => {
                btns.forEach(btn => btn.classList.remove("isSelected"))
                //btn.style.setProperty('--btn-color','#222')
                btn.classList.add('isSelected')
                const value = btn.dataset.value;
                const optionName = btn.dataset.optionname;
                if (value && optionName) {
                    selectedOptions[optionName] = value
                }
                findVariant()
            })
        });

        // dropdown event binding
        const selectHeader = modal.querySelector(".select-header");
        selectHeader.addEventListener('click', () => {
            selectHeader.closest('.select-option-wrapper').classList.toggle('select-open');
        })
        const selects = modal.querySelectorAll(".select-option")
        selects.forEach(select => {
            select.addEventListener("click", () => {
                selects.forEach(select => select.classList.remove("active-select"));
                selectHeader.closest('.select-option-wrapper').classList.remove('select-open');
                select.classList.add('active-select')
                const value = select.dataset.value;
                const optionName = select.dataset.optionname;
                selectHeader.querySelector("span").textContent = value;

                if (value && optionName) {
                    selectedOptions[optionName] = value
                }
                findVariant()
            })
        });

        // ATC button event binding
        const sendItemToCart = async () => {
            const variantId = selectedVariantInput.value;
            if (!variantId) {
                errorMsg.style.display = "block";
                setTimeout(() => {
                    errorMsg.style.display = "none"
                }, 3000);
                return null;
            }

            let items = [{
                id: variantId,
                quantity: 1
            }]

            const isAddon = Object.entries(selectedOptions).every(([key, value]) => {
                if (!value) return false;
                key = key.toLowerCase()
                value = value.toLowerCase();
                if (key == 'size' && (value == 'm' || value == 'medium')) {
                    return true
                } else if (key == 'color' && value == 'black') {
                    return true
                } else {
                    return false;
                }
            })
            // if color:black & size : m selected add addons item
            if (isAddon) {
                items.push({
                    id: softWinterBlackMVariant,
                    quantity: 1
                })
            }
            let options = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    'items': items
                })
            }

            try {
                const resp = await fetch(`/cart/add.js`, options);
                const data = await resp.json();
                if (data?.items.length > 0) {
                    const itemsTitles = `${data.items.map(item=>item.title).join(" And ")}`;
                    successMsg.style.display = "flex";
                    successMsg.querySelector("p").textContent = "";
                    successMsg.querySelector("p").textContent = `${itemsTitles} added to the cart`
                    setTimeout(() => {
                        successMsg.style.display = "none"
                    }, 5000);
                }
            } catch (e) {
                let msg = `Oops! something wrong`;
                console.log(`Error:${e.message} `)
                let preMsg = errorMsg.textContent;
                errorMsg.textContent = msg;
                errorMsg.style.display = "block";
                setTimeout(() => {
                    errorMsg.textContent = preMsg
                    errorMsg.style.display = "none"
                }, 5000);
                return null;
            }

        }
        atcButton.addEventListener("click", sendItemToCart)


        popupBtn.addEventListener('click', (e) => {
            document.querySelectorAll(".custom-gift-card-modal").forEach(modal => modal.style.display = 'none');
            modal.style.display = "flex"
        })
    })

})()