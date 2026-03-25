export const APP_ROUTES = {
  HOME: '/',
  INVENTORY: '/inventory.html',
  CART: '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
} as const;

export const SORT_OPTIONS = {
  NAME_A_Z: 'az',
  NAME_Z_A: 'za',
  PRICE_LOW_HIGH: 'lohi',
  PRICE_HIGH_LOW: 'hilo',
} as const;

export const TAX_RATE = 0.08;

export const PRODUCTS = {
  SAUCE_LABS_BACKPACK: {
    name: 'Sauce Labs Backpack',
    price: 29.99,
    addToCartTestId: 'add-to-cart-sauce-labs-backpack',
    removeTestId: 'remove-sauce-labs-backpack',
    id: 'sauce-labs-backpack',
  },
  SAUCE_LABS_BIKE_LIGHT: {
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    addToCartTestId: 'add-to-cart-sauce-labs-bike-light',
    removeTestId: 'remove-sauce-labs-bike-light',
    id: 'sauce-labs-bike-light',
  },
  SAUCE_LABS_BOLT_T_SHIRT: {
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    addToCartTestId: 'add-to-cart-sauce-labs-bolt-t-shirt',
    removeTestId: 'remove-sauce-labs-bolt-t-shirt',
    id: 'sauce-labs-bolt-t-shirt',
  },
  SAUCE_LABS_FLEECE_JACKET: {
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    addToCartTestId: 'add-to-cart-sauce-labs-fleece-jacket',
    removeTestId: 'remove-sauce-labs-fleece-jacket',
    id: 'sauce-labs-fleece-jacket',
  },
  SAUCE_LABS_ONESIE: {
    name: 'Sauce Labs Onesie',
    price: 7.99,
    addToCartTestId: 'add-to-cart-sauce-labs-onesie',
    removeTestId: 'remove-sauce-labs-onesie',
    id: 'sauce-labs-onesie',
  },
  TEST_ALL_THE_THINGS_T_SHIRT: {
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    addToCartTestId: 'add-to-cart-test-allthethings-t-shirt-red',
    removeTestId: 'remove-test-allthethings-t-shirt-red',
    id: 'test-allthethings-t-shirt-red',
  },
} as const;

export const EXPECTED_PRODUCT_COUNT = 6;

export const ERROR_MESSAGES = {
  LOGIN: {
    INVALID_CREDENTIALS: 'Epic sadface: Username and password do not match any user in this service',
    LOCKED_OUT: 'Epic sadface: Sorry, this user has been locked out.',
    MISSING_USERNAME: 'Epic sadface: Username is required',
    MISSING_PASSWORD: 'Epic sadface: Password is required',
  },
  CHECKOUT: {
    MISSING_FIRST_NAME: 'Error: First Name is required',
    MISSING_LAST_NAME: 'Error: Last Name is required',
    MISSING_POSTAL_CODE: 'Error: Postal Code is required',
  },
} as const;

export const CHECKOUT_COMPLETE = {
  HEADER: 'Thank you for your order!',
  TEXT: 'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
  BACK_HOME_LABEL: 'Back Home',
} as const;

export const PAYMENT_INFO = 'SauceCard #31337';
export const SHIPPING_INFO = 'Free Pony Express Delivery!';
