/**
  Copyright (C) 2009-2012. David Thevenin, ViniSketch SARL (c), and 
  contributors. All rights reserved
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Lesser General Public License as published
  by the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU Lesser General Public License for more details.
  
  You should have received a copy of the GNU Lesser General Public License
  along with this program. If not, see <http://www.gnu.org/licenses/>.
 
 Use code from Canto.js Copyright 2010 Steven Levithan <stevenlevithan.com>
*/

/**
 *  @class
 *  vs.core.Array is an Array of Object or Model.
 *
 * @extends vs.core.Model
 * @author David Thevenin
 *
 *  @constructor
 *  Main constructor
 *
 * @name vs.core.Array
 *
 * @param {Object} config the configuration structure
*/
function VSArray (config)
{
  this.parent = vs.core.Model;
  this.parent (config);
  this.constructor = vs.core.Array;
}

VSArray.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
   _data: null,
   _model_class: null,
  
  /*****************************************************************
   *              
   ****************************************************************/
   
  /**
   * @name vs.core.Array#initComponent
   * @function
   * @protected
   */
   initComponent : function ()
   {
     this._data = [];
   },
  
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Returns the nth element
   *
   * @name vs.core.Array#item
   * @function
   *
   * @param {number} index
   */
  item : function (index)
  {
    return this._data [index];
  },
  
  /**
   * @private
   * @name vs.core.Array#_instanceModel
   * @function
   */
  _instanciateModel : function (obj)
  {
    if (obj instanceof vs.core.Model) return obj;
    if (obj instanceof Object && this._model_class)
    {
      try
      {
        var _model = new this._model_class (obj);
        _model.init ();
        return _model;
      }
      catch (e)
      {
        console.error (e.toString ());
      }
    }
    
    return obj;
  },
  
  /**
   * Adds one or more elements to the end of an array and returns the
   * new length of the array.
   *
   * @name vs.core.Array#add
   * @function
   *
   * @param {element1, ..., elementN} datas
   */
  add : function ()
  {
    var args = [], i = 0;
    for (;i < arguments.length; i++)
    { args.push (this._instanciateModel (arguments[i])); }
    
    this._data.push.apply (this._data, args);
    
    if (this.hasToPropagateChange ()) this.change ('add');
    
    return this.length;
  },
  
  /**
   * Adds one or more elements to the end of an array and returns the
   *
   * @name vs.core.Array#addAtIndex
   * @function
   *
   * @param {number} index the position 
   * @param {element1, ..., elementN} datas
   */
  addAtIndex : function ()
  {
    if (arguments.length < 2) { return; }
    var args = [], i = 1;
    for (;i < arguments.length; i++)
    { args.push (this._instanciateModel (arguments[i])); }
    
    this._data.splice.apply (this._data, args);
    if (this.hasToPropagateChange ())
      this.change ('add', args[0], args.length - 2);
  },
    
  /**
   * Removes the elements in the specified interval of this Array.<br/> 
   * Shifts any subsequent elements to the left (subtracts one from
   * their indices).<br/>
   *
   * @example
   * myarray.remove (3); //remove the fourth item
   * ...
   * myarray.remove (3, 5); //remove the fourth, fifth and sixth items
   *
   * @name vs.core.Array#remove
   * @function
   *
   * @param {int} from Index of the first element to be removed
   * @param {int} to Index of the last element to be removed
   */
  remove : function (from, to)
  {
    this._data.remove (from, to);
    if (this.hasToPropagateChange ()) this.change ('remove', from, to);
  },
  
  /**
   * Removes all elements of this Array.<br/> 
   * @name vs.core.Array#removeAll
   * @function
   */
  removeAll : function ()
  {
    this._data = [];
    if (this.hasToPropagateChange ()) this.change ('removeall');
  },
  
  /**
   *  .
   *
   * @name vs.core.Array#indexOf
   * @function
   * @param {String} str the url to parse
   */
  indexOf : function ()
  {
    throw ("method not yet implemented");
//    this._data.push ();
  },
  
  /*****************************************************************
   *              
   ****************************************************************/

  /**
   *  Returns a copy of the objet's properties for JSON stringification.<p/>
   *  This can be used for persistence or serialization.
   *
   * @name vs.core.Array#toJSON
   * @function
   * @return {String} The JSON String
   */
  toJSON : function ()
  {
    var json = this._toJSON ("{"), i = 0, obj;
    
    json += ", \"data\": [";
    for (;i < this._data.length; i++)
    {
      obj = this._data [i];
      if (!obj) continue;
      if (obj.toJSON) json += obj.toJSON ();
      else json += JSON.stringify (obj);
      if (i < this._data.length - 1) json += ',';
    }
    
    json += "]}";
    return json;
  },
  
  /**
   *  Set objet's properties from JSON stringification.<p/>
   *  This can be used when retrieve data from serialization.
   *
   * @name vs.core.Array#parseJSON
   * @function
   * @param {String} json The JSON String
   */
  parseJSON : function (json)
  {
    try {
      var obj = (json && util.parseJSON (json)) || {}, i, key, _model, item,
        self = this;
      
      function fillArray (data)
      {
        self._data = [];
        for (i = 0; i < data.length; i++)
        {
          item = data [i];
          if (self._model_class)
          {
            _model = new self._model_class ();
            _model.init ();
          
            for (key in item) { _model ['_' + key] = item [key]; }
            self.add (_model);
          }
          else self.add (item);
        }
      };
  
      if (util.isArray (obj))
      {
        fillArray (obj);
      }
      else for (key in obj)
      {
        this._data = [];
        if (key == 'data')
        {
          fillArray (obj.data);
        }
        else this ['_' + key] = obj [key];
      }
    }
    catch (e)
    {
      console.error ("vs.core.Array.parseJSON failed. " + e.toString ());
    }
  },
};
util.extendClass (VSArray, core.Model);

/********************************************************************
                  Define class properties
********************************************************************/

util.defineClassProperties (VSArray, {
  "data" : {
    /**
     * Set data elements for the array
     *
     * @name vs.core.Array#data 
     * @type {Array | vs.core.Array}
     */
    set : function (v)
    {
      if (!this.__i__) throw ("Component not initialized");
      
      if (util.isArray (v)) this._data = v.slice ();
      else if (v instanceof VSArray)
      {
        this._data = v._data.slice ();
      }
      else return;
      
      if (this.hasToPropagateChange ()) this.change ('add');
    },
    
    /**
     * Returns an array of elements
     *
     * @name vs.core.Array#data 
     * @type {Array}
     */
    get : function ()
    {
      if (!this.__i__) throw ("Component not initialized");
      return this._data.slice ();
    }
  },
  
  "length" : {
    /**
     * Reflects the number of elements in an array.
     *
     * @name vs.core.Array#length 
     * @type {number}
     */
    get : function ()
    {
      if (!this.__i__) throw ("Component not initialized");
      return this._data.length;
    }
  },
  
  "modelClass" : {
    /**
     * Set this property to specify the model class that the Array contains
     *
     * @name vs.core.Array#modelClass 
     * @type {vs.core.Model}
     */
    set : function (v)
    {
      if (!(v instanceof Function)) return;
      
      this._model_class = v;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
core.Array = VSArray;
