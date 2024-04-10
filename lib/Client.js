'use strict';

const { OAuth2Client } = require('homey-oauth2app');
const { blank, filled } = require('./Utils');

class Client extends OAuth2Client {

  static API_URL = 'https://api.senzthermostat.nvent.com';
  static TOKEN_URL = 'https://id.senzthermostat.nvent.com/connect/token';
  static AUTHORIZATION_URL = 'https://id.senzthermostat.nvent.com/connect/authorize';
  static SCOPES = ['offline_access', 'restapi'];

  /*
  | Device functions
  */

  // Return all devices
  async getDevices() {
    return this._get('Thermostat');
  }

  /*
  | Device actions
  */

  // Update device mode
  async updateMode(data) {
    const { mode } = data;

    // Delete mode from data
    delete data.mode;

    return this._put(`Mode/${mode}`, data);
  }

  // Update device target temperature
  async updateTargetTemperature(data) {
    const { mode } = data;

    // Delete mode from data
    delete data.mode;

    return this._put(`Mode/${mode}`, data);
  }

  /*
  | Support functions
  */

  // Perform GET request
  async _get(path) {
    path = `/api/v1/${path}`;

    this.log('GET', path);

    return this.get({
      path,
      query: '',
      headers: {},
    });
  }

  // Perform PUT request
  async _put(path, json = null) {
    path = `/api/v1/${path}`;

    this.log('PUT', path, JSON.stringify(json));

    return this.put({
      path,
      query: '',
      json,
      headers: {},
    });
  }

  /*
  | Client events
  */

  // Client initialized
  async onInit() {
    this.log('Initialized');
  }

  // Client destroyed
  async onUninit() {
    this.log('Destroyed');
  }

  // Request response is not OK
  async onHandleNotOK({
    body, status, statusText, headers,
  }) {
    this.error('Request not OK', JSON.stringify({
      body,
      status,
      statusText,
      headers,
    }));

    const error = filled(body.Messages) && filled(body.Messages[0]) ? body.Messages[0] : null;

    // Client errors
    if (status === 401 || status === 403 || status === 404) {
      return new Error(this.homey.__(`error.${status}`));
    }

    // Internal server error
    if (status >= 500 && status < 600) {
      return new Error(this.homey.__('error.50x'));
    }

    // Custom error message
    if (error) {
      return new Error(error);
    }

    // Unknown error
    return new Error(this.homey.__('error.unknown'));
  }

  // Handle result
  async onHandleResult({
    result, status, statusText, headers,
  }) {
    if (blank(result) || typeof result === 'object') {
      if (filled(result)) {
        this.log('[Response]', JSON.stringify(result));
      }

      return result;
    }

    this.error('[Response]', result);

    throw new Error(this.homey.__('error.50x'));
  }

  // Request error
  async onRequestError({ err }) {
    this.error('[Request]', err.toString());

    throw new Error(this.homey.__('error.network'));
  }

}

module.exports = Client;
