'use strict';

const { shell } = require('electron');


const ALLOWED_DOMAINS = [
  'zoom.us',
  'zoom.com',

  'accounts.google.com',
  'login.microsoftonline.com',
  'login.live.com',
  'appleid.apple.com',
  'facebook.com',
];


function isAllowedDomain(urlString) {
  try {
    const { hostname } = new URL(urlString);
    return ALLOWED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {

    return false;
  }
}


function attachNavigationGuards(webContents) {

  webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedDomain(url)) {

      return { action: 'allow' };
    }


    shell.openExternal(url);
    return { action: 'deny' };
  });


  webContents.on('will-navigate', (event, url) => {
    if (!isAllowedDomain(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }

  });
}

module.exports = { attachNavigationGuards, isAllowedDomain };
