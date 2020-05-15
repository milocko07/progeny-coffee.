
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"></link>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>

<script>
$(function() {

    debugger;
    if (window.location.pathname === "/shop/subscription-checkout-payment2") {
        if (sessionStorage.getItem('selectedCoffeesList') 
        && sessionStorage.getItem('totalPrice')
        && sessionStorage.getItem('selectedFrequency')) {

            const selectedCoffeesList = JSON.parse(sessionStorage.selectedCoffeesList);
            let summarySubTotal = 0;
            let summaryDiscount = 0;
            let summaryTotalPrice = 0;

            const uiCheckoutStorage = {
                shippingMethodSection: $('#shippingMethodSection'),
                billingAddressSection: $('#billingAddressSection'),
                giftNotesSection: $('#giftNotesSection'),

                sameBillingAddressCheck: $('#isBillingAddress'),

                shippingState: $('#shippingState'),
                promoCode: $('#promoCode'),

                shippingSecondFullName: $('#shippingSecondFullName'),
                shippingSecondAddress1: $('#shippingSecondAddress1'),
                shippingSecondCity: $('#shippingSecondCity'),
                shippingSecondState: $('#shippingSecondState'),
                shippingSecondZipCode: $('#shippingSecondZipCode'),

                subscriptionDetailsSection: $('#subscriptionDetailsSection'),
                exampleProduct01: $('#exampleProduct01'),
                exampleProduct02: $('#exampleProduct02'),

                summaryDiscountSection: $('#summaryDiscountSection'),
                summarySubTotal: $('#summarySubTotal'),
                summaryTotal: $("#summaryTotal"),
                summaryFrequency: $("#summaryFrequency"),
                errorMessage: $("#errorMessage")
            };

            uiCheckoutStorage.shippingMethodSection.attr("style", "display: none;");
            uiCheckoutStorage.giftNotesSection.attr("style", "display: none;");
            uiCheckoutStorage.exampleProduct01.attr("style", "display: none;");
            uiCheckoutStorage.exampleProduct02.attr("style", "display: none;");
            uiCheckoutStorage.billingAddressSection.attr("style", "display: none;");
            uiCheckoutStorage.summaryDiscountSection.attr("style", "display: none;")
            uiCheckoutStorage.errorMessage.attr("style", "visibility: hidden;");
            uiCheckoutStorage.shippingState.prop('required',true);
            uiCheckoutStorage.promoCode.prop('required',false);

            uiCheckoutStorage.sameBillingAddressCheck.attr("style", "margin-left: -20px;");
            uiCheckoutStorage.shippingSecondFullName.prop('required',false);
            uiCheckoutStorage.shippingSecondAddress1.prop('required',false);
            uiCheckoutStorage.shippingSecondCity.prop('required',false);
            uiCheckoutStorage.shippingSecondState.prop('required',false);
            uiCheckoutStorage.shippingSecondZipCode.prop('required',false);

            renderProductDetails = function() {
                selectedCoffeesList.forEach(coffee => {
                        const imageStyle = coffee.image;
                        const itemHtml = `<div class="order-item" style="margin-bottom: 8px;"> \
                        <div class="checkout_productimage" style="margin-bottom: 0; background-image: url(${coffee.image}); ">
                        </div> \
                        <div class="checkout-product-n-wrap">
                            <label for="quantity-${coffee.numberBags}" class="cart-item-name">${coffee.name}</label>
                            <div class="div-block-550">
                                <div class="paragraph-71">${coffee.numberBags}</div>
                                <div class="paragraph-71">x</div>
                                <div class="paragraph-71">$${coffee.basePrice}</div>
                            </div>
                            <div class="div-block-550">
                                <div class="paragraph-71">12oz
                            </div>
                        </div>
                    </div> \
                    ` 
                    $(itemHtml).appendTo(uiCheckoutStorage.subscriptionDetailsSection);
                });
            };

            renderProductDetails();

            renderSummaryTotalPrice = function(summaryDiscount) {
                summaryTotalPrice = +(summarySubTotal - summaryDiscount);
                const priceToShow = summaryTotalPrice.toFixed(2)
                uiCheckoutStorage.summaryTotal.html("$" + priceToShow);
            };

            summarySubTotal = +sessionStorage.getItem('totalPrice');
            uiCheckoutStorage.summarySubTotal.html("$" + summarySubTotal.toFixed(2));
            uiCheckoutStorage.summaryFrequency.html(sessionStorage.getItem('selectedFrequency'));

            renderSummaryTotalPrice(summaryDiscount);
            
            uiCheckoutStorage.sameBillingAddressCheck.change(function(evt) {
                sameBillingChecked = $(uiCheckoutStorage.sameBillingAddressCheck)[0].checked;
                uiCheckoutStorage.billingAddressSection.attr("style", sameBillingChecked ? "display: none;" : "display: block;");
                uiCheckoutStorage.shippingSecondFullName.prop('required',!sameBillingChecked);
                uiCheckoutStorage.shippingSecondAddress1.prop('required',!sameBillingChecked);
                uiCheckoutStorage.shippingSecondCity.prop('required',!sameBillingChecked);
                uiCheckoutStorage.shippingSecondState.prop('required',!sameBillingChecked);
                uiCheckoutStorage.shippingSecondZipCode.prop('required',!sameBillingChecked);
            });

            $("#btnCoupon").click(function(evt) {
                evt.preventDefault();
                const couponText = $("#promoCode").val(); 
                uiCheckoutStorage.errorMessage.text('');
                uiCheckoutStorage.errorMessage.attr("style", "visibility: hidden;");
                if(couponText === '') {
                    uiCheckoutStorage.errorMessage.attr("style", "visibility: visible;");
                    uiCheckoutStorage.errorMessage.text('please, enter a value');
                    return
                };
                const couponButton = $(this)[0];
                const couponCodeText = $("#promoCode")[0];
                couponButton.disabled = true;
                couponCodeText.disabled = true;

                return fetch('https://app-mg-dev-prgny-central-001.azurewebsites.net/api/v1/Stripe/ValidateCoupon/'+couponText, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json'
                }
                }).then(function(response) {
                    return response.json();
                }).then(function(validation) {
                if (validation.error) {
                    uiCheckoutStorage.errorMessage.text(validation.error);
                    uiCheckoutStorage.errorMessage.attr("style", "visibility: visible;");
                    couponButton.disabled = false;
                    couponCodeText.disabled = false;
                } else if(validation.valid) {
                    if (validation.percent_off) {
                        summaryDiscount = (summarySubTotal * validation.percent_off) / 100;
                    } else {
                        summaryDiscount = validation.amount_off;
                    }
                    uiCheckoutStorage.summaryDiscountSection.attr("style", "visibility: visible;");
                    $('#discountValue').html("-$" + summaryDiscount.toFixed(2));
                    $("#promoCode").val('');
                    renderSummaryTotalPrice(summaryDiscount);
                    } else {
                        couponButton.disabled = false;
                        couponCodeText.disabled = false;
                        uiCheckoutStorage.errorMessage.text(validation.error);
                        uiCheckoutStorage.errorMessage.attr("style", "visibility: visible;");
                    }
                });
            });

            var allPlans = {};
            
            // stripeElements = function() {
            //     stripe = Stripe(publicKey);
            //     var elements = stripe.elements();
            //     var card = elements.create('card');
            //     card.mount('#card-element');
            // }

            $("#formSubscription").submit(function(evt){
                evt.preventDefault();
                var publicKey = 'pk_test_I4WQbzQmUAygwXdqfS1FweoJ'; 
                var stripe = Stripe(publicKey);
                var elements = stripe.elements();
                var card = elements.create('card');
                card.mount('#card-element');
                pay(stripe, card);
                return false;
            });

            pay = function(stripe, card) {
                var errorMsg = $("#error-message");
                var successMsg = $("#success-message");
                var checkoutBtn = $("#btnCheckout");
                stripe
                  .createPaymentMethod(
                    {
                      type: 'card',
                      card: card,
                      billing_details: {
                          email: $("#email").val(),
                          name: $("#billingName").val(),
                          address : {
                              country: $("#billingAddressCountry").children("option:selected").val(),
                              state: $("#billingAddressState").val(),
                              city: $("#billingAddressCity").val(),
                              line1 : $("#billingAddressLine1").val(),
                              line2 : $("#billingAddressLine2").val(),
                              postal_code : $("#billingAddressZipCode").val(),
                          }  
                      }	
                  })
                  .then(function(result) {
                    if (result.error) {
                      checkoutBtn.disabled = false;
                      // The card was declined (i.e. insufficient funds, card has expired, etc)
                      successMsg.hide();
                      errorMsg.show();
                      errorMsg.text(result.error.message);
                      console.log(result.error.message);
                      setTimeout(function() {
                        errorMsg.text('');
                      }, 4000);
                    } else {
                      createSubscription(result.paymentMethod);
                    }
                  });
                  
              };

            //stripeElements();
        } else {
            window.location.pathname = '../shop/subscription';
        }
    }
});
</script>
