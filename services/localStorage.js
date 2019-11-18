import AsyncStorage from '@react-native-community/async-storage';
import EventEmitter from 'eventemitter3';
var _ = require('lodash');
import enabled from 'enabled';
/**
 * All available API methods on which our modifier could be called.
 *
 * @type {Array}
 * @public
 */
const APIMethods = ['get', 'save', 'delete', 'update', 'keys', 'push', 'set', 'pop'];

/**
 * Registers a new key modifier for a given Map().
 *
 * @param {Map} map The map in which the modifier needs to be stored.
 * @param {String} pattern Pattern that matches the keys where the modifier should trigger.
 * @param {Function|Object} modifiers Object with callbacks or all single callback.
 * @param {LocalStorage} self Context to bind the modifiers on.
 * @private
 */
function register(map, { pattern, modifiers, context, options }) {
  if (typeof modifiers === 'function') {
    modifiers = APIMethods.reduce((memo, key) => {
      memo[key] = modifiers;
      return memo;
    }, {});
  }

  const { order = 100 } = options;

  Object.keys(modifiers).forEach(method => {
    const previous = map.get(method) || [];
    const modifier = modifiers[method];

    map.set(
      method,
      previous
        .concat({
          pattern,
          order,

          /**
           * Wrap our given modifier function so we can transform it in our
           * desired function signature where the modifiers receive the data
           * as first argument, and optional options as second argument.
           *
           * @param {Object} args The data for the modifier.
           * @returns {Mixed} Result.
           * @private
           */
          modifier: async function wrapper(args) {
            return await modifier.call(context, args, options);
          },
        })
        .sort((a, b) => b.order - a.order)
    );
  });

  return context;
}

/**
 * Run the modifiers over the given dataset.
 *
 * @param {Map} map Dataset that contains the modifiers.
 * @param {Object} data The data that is passed around between modifers.
 * @returns {Object} Data.
 */
async function run(map, data) {
  const modifiers = map.get(data.method) || [];

  let result = data;

  for (let i = 0; i < modifiers.length; i++) {
    const { pattern, modifier } = modifiers[i];
    if (!enabled(result.key, pattern)) continue;

    const changed = await modifier(result);

    if (changed)
      result = {
        ...result,
        ...changed,
      };
  }

  return result;
}

/**
 * Our enhanced LocalStorage.
 *
 * @param {Map} map Dataset that contains the modifiers.
 * @param {Object} data The data that is passed around between modifers.
 * @returns {Object} Data.
 */
class LocalStorage extends EventEmitter {
  constructor() {
    super();

    this.plugins = new Map(); // Storage for plugins.
    this.post = new Map(); // Storage for before hooks.
    this.pre = new Map(); // Storage for after hooks.
    this.kill = []; // Methods that need to be called upon destroy.

    //
    // We want to re-define our public API methods so we can automate
    // some of the pre/post processing to reduce duplicate code.
    //
    APIMethods.forEach(method => {
      this.redefine(method);
    });
  }

  /**
   * Redefine the API methods so we can enhance them with our pre and post
   * processing.
   *
   * @param {String} method The method that needs to be redefined.
   * @public
   */
  redefine(method) {
    const fn = this[method];

    this[method] = async function proxy(key, value, options) {
      const data = { key, value, method, options };

      const pre = (await run(this.pre, data)) || {};

      const api = { ...pre, ...((await fn.call(this, pre)) || {}) };

      const post = (await run(this.post, api)) || {};

      return post.value;
    }.bind(this);

    //
    // Reset the displayName so we have the correct function name show up
    // in stacktraces instead of `proxy`.
    //
    this[method].displayName = method;
  }

  /**
   * Registers a modifier for a given pattern before the API method is
   * called. This allows you to modify the key, or even intercept the
   * request completely and hand it off to something else.
   *
   * @param {String} pattern Pattern that they key should match.
   * @param {Object|Function} modifiers methodname->fn map, or one function for all.
   * @returns {LocalStorage} Self, for chaining purposes.
   * @public
   */
  before(pattern, modifiers, context = this, options = {}) {
    return register(this.pre, {
      context,
      modifiers,
      options,
      pattern,
    });
  }

  /**
   * Registers a modifier for a given pattern after the API method is
   * called. This allows you to modify the value, or even intercept the
   * request completely and hand it off to something else.
   *
   * @param {String} pattern Pattern that they key should match.
   * @param {Object|Function} modifiers methodname->fn map, or one function for all.
   * @returns {LocalStorage} Self, for chaining purposes.
   * @public
   */
  after(pattern, modifiers, context = this, options = {}) {
    return register(this.post, {
      context,
      modifiers,
      options,
      pattern,
    });
  }

  /**
   * Register a new plugin.
   *
   * @param {String} pattern The key pattern the plugin should trigger on.
   * @param {Function} plugin The plugin function.
   * @param {Object} options Plugin options.
   * @public
   */
  use(pattern, plugin, options = {}) {
    const before = this.before.bind(this, pattern);
    const after = this.after.bind(this, pattern);
    const engine = this;

    plugin({
      /**
       * Registers a clean up function from the plugin that needs to be
       * called when the storage engine is destroyed.
       *
       * @param {Function} fn Function to execute upon clean-up.
       * @public
       */
      destroy: function destroy(fn) {
        engine.kill.push(fn);
      },

      /**
       * Check if a given key is enabled by the pattern.
       *
       * @param {String} key Key to check if enabled.
       * @returns {Boolean} Indication of the key is enabled.
       * @public
       */
      enabled: function isEnabled(key) {
        return enabled(key, pattern);
      },

      before, // Pre-bound before hook.
      after, // Pre-bound after hook.
      pattern, // The pattern/keys to trigger on.
      options, // Options for the plugin.
      engine, // Reference to our storage instance.
    });

    return this;
  }

  /**
   * Destroy the created storage instance.
   *
   * @returns {Mixed} What ever the kill() functions return.
   * @public
   */
  async destroy() {
    const kill = this.kill.slice(0);

    this.kill.lenght = 0;
    this.plugins.clear();
    this.post.clear();
    this.pre.clear();

    return await Promise.all(kill.map(fn => fn()));
  }

  /**
   * Get a one or more value for a key or array of keys from AsyncStorage
   * @param {String|Array} key A key or array of keys
   * @return {Promise}
   */
  async get({ key, value, method }) {
    try {
      if (!Array.isArray(key)) {
        const returnedValue = await AsyncStorage.getItem(key);
        value = JSON.parse(returnedValue);
      } else {
        const returnedValue = await AsyncStorage.multiGet(key);
        value = returnedValue.map(value => {
          return JSON.parse(value[1]);
        });
      }
      return { key, value };
    } catch (error) {
      console.error(error, 'get');
    }
  }

  /**
   * Save a key value pair or a series of key value pairs to AsyncStorage.
   * @param  {String|Array} key The key or an array of key/value pairs
   * @param  {Any} value The value to save
   * @return {Promise}
   */
  async save({ key, value, method }) {
    try {
      if (!Array.isArray(key)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } else {
        var pairs = key.map(pair => [pair[0], JSON.stringify(pair[1])]);
        await AsyncStorage.multiSet(pairs);
      }
      return { key, value };
    } catch (error) {
      console.error(error, 'save');
    }
  }

  /**
   * Updates the value in the store for a given key in AsyncStorage. If the value is a string it will be replaced. If the value is an object it will be deep merged.
   * @param  {String} key The key
   * @param  {Value} value The value to update with
   * @return {Promise}
   */
  async update({ key, value, method }) {
    try {
      const item = await this.get(key);
      value = typeof value === 'string' ? value : _.merge({}, item, value);
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return { key, value };
    } catch (error) {
      console.error(error, '_update');
    }
  }

  /**
   * Delete the value for a given key in AsyncStorage.
   * @param  {String|Array} key The key or an array of keys to be deleted
   * @return {Promise}
   */
  async delete({ key, value, method }) {
    try {
      if (Array.isArray(key)) {
        await AsyncStorage.multiRemove(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
      return { key, value };
    } catch (error) {
      console.error(error, 'delete');
    }
  }

  /**
   * Get all keys in AsyncStorage.
   * @return {Promise} A promise which when it resolves gets passed the saved keys in AsyncStorage.
   */
  async keys({ method }) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return { value: keys };
    } catch (error) {
      console.error(error, 'keys');
    }
  }

  /**
   * Push a value onto an array stored in AsyncStorage by key or create a new array in AsyncStorage for a key if it's not yet defined.
   * @param {String} key They key
   * @param {Any} value The value to push onto the array
   * @param {Object} options that contains isExist and predicate for existance and function to check for the existance
   * @return {Boolean} returns wether the item pushed to the array or not
   */
  async push({ key, value, method, options }) {
    try {
      const currentValue = await this.get(key);

      if (currentValue === null) {
        // if there is no current value populate it with the new value
        await this.save(key, [value]);
        value = true
      } else {
        if (Array.isArray(currentValue)) {
          const { isExist } = options || false;
          const { predicate } = options || {};
          let exist = false;
          if (isExist) {
            if (predicate) {
              exist = _.some(currentValue, item => predicate(item));
            } else {
              exist = _.some(currentValue, function(item) {
                return item === value;
              });
            }
          }

          if (!exist){
            await this.save(key, [...currentValue, value]);
            value = true
          }else{
            value = false
          }
        }
        else 
          throw new Error( `Existing value for key "${key}" must be of type null or Array, received ${typeof currentValue}.`);
      }

      return { key, value };
    } catch (error) {
      console.error(error, 'push');
    }
  }

  /**
   * update an item from an array stored in AsyncStorage
   * @param {String} key They key
   * @param {Any} value The value to look for to update from the array of string, if array of objects is the value to match with
   * @param {Object} options that contains the path of the property to get with and the newValue that will be updated with
   * @return {Promise}
   */
  async set({key, value, method, options}) {
    try {
      const currentValue = await this.get(key);

      if (currentValue === null) {
        throw new Error(`There is no Array with key "${key}" stored, received ${typeof currentValue}.`);
      } else {

        if (Array.isArray(currentValue)) {
          const { path, newValue } = options
          if (path) {
            _.remove(currentValue, [path, value]);
          } else {
            _.remove(currentValue, function(v) {
              return v === value;
            });
          }
          currentValue.push(newValue);
          await this.save(key, currentValue);
        }
        else
          throw new Error( `Existing value for key "${key}" must be of type null or Array, received ${typeof currentValue}.` );
      }
      return {key, value}

      
    } catch (error) {
      console.error(error, 'update');
    }
  }

  /**
   * delete an item from an array stored in AsyncStorage by its value
   * @param {String} key They key
   * @param {Any} value The value to delete from the array of string, if array of objects is the value to match with
   * @param {String|Array} options that contains the path of the property to get
   * @return {Promise}
   */
  async pop({key, value, method, options}) {
    try {
      const currentValue = await this.get(key);

      if (currentValue === null) {
        throw new Error(`There is no Array with key "${key}" stored, received ${typeof currentValue}.`);
      } else {

        if (Array.isArray(currentValue)) {
            const { path } = options || {}
          if (path) {
            _.remove(currentValue, [path, value]);
          } else {
            _.remove(currentValue, function(v) {
              return v === value;
            });
          }
          await this.save(key, currentValue);
        }
        else
          throw new Error(`Existing value for key "${key}" must be of type null or Array, received ${typeof currentValue}.`);
      }
      return {key, value}
    } catch (error) {
      console.error(error, 'pop');
    }
  }
}

//
// We want to expose pre-initialized storage instance as default so our
// main API functions exactly as the AsyncStorage API, ready to go.
//
const storage = new LocalStorage();
export { storage as default, LocalStorage, register, run };
