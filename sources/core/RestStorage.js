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
*/

/**
*/
function RestStorage (config)
{
  this.parent = DataStorage;
  this.parent (config);
  this.constructor = RestStorage;
  
  this._xhrs = {};
}

RestStorage.prototype = {

  /*****************************************************************
   *
   ****************************************************************/
   
  /**
   *
   * @protected
   * @type {vs.core.RestStorage}
   */
  _xhrs: null,
  
  /**
   *
   * @protected
   * @type {String}
   */
  _url: '',
  
  /*****************************************************************
   *              
   ****************************************************************/
   
  /**
   * @protected
   * @function
   */
  initComponent: function ()
  {
    DataStorage.prototype.initComponent.call (this);
  },
   
  /**
   * @protected
   * @function
   */
  destructor: function ()
  {
    DataStorage.prototype.destructor.call (this);
  },
  
  /*****************************************************************
   *              
   ****************************************************************/
  
  /**
   * Save models. If a name is specified, it saves only the model
   * associated to the name.
   *
   * @name vs.core.RestStorage#save
   * @function
   * @param {String} name model name to save [optional]
   */
  save : function (name)
  {
    var self = this;
    function _save (name)
    {
      var json, model = self.__models__ [name];
      if (!model) return;
      
      try
      {
        if (model.toJSON) json = model.toJSON ();
        else json = JSON.stringify (model);
      }
      catch (e)
      {
        error.log (e);
        self.propagate ("error", e);
      }
      
      RestStorage.setItem (name, json);
    }
    if (name) _save (name);
    else for (var name in this.__models__) _save (name);
    
    self.propagate ("save");
  },
  
  /**
   * Load models. If a name is specified, it load only the model
   * associated to the name.
   *
   * @name vs.core.RestStorage#load
   * @function
   * @param {String} name model name to save [optional]
   */
  load : function (name)
  {
    var type = "GET";
    
    var dataType = 'xml';
      
    var self = this;
    function _load (name)
    {
      try {
        var model = self.__models__ [name];
        if (!model) return;
        
        var url = self._url + name + '.json';
        
        var ps = model.getProperties (), j = 0;
        if (ps && ps.length)
        {
          url += '?';
          for (var i = 0; i < ps.length; i ++)
          {
            var prop_name = ps[i], value = model ['_' + prop_name];
            if (typeof value == "undefined") continue;
            if (j++) url += ';';
            url += prop_name + '=' + value;
          }
        }

        var xhr = new HTTPRequest ().init ();
        self._xhrs [xhr.id] = name;
        xhr.bind ('textload', self, self._processResult);

        xhr.url = url;
        xhr.method = "GET";
        xhr.contentType = "application/json";
        xhr.send ();
      }
      catch (e)
      {
        console.error ("LocalStorate.load failed. " + e.toString ());
      }
    }
    if (name) _load (name);
    else for (var name in this.__models__) _load (name);
  },
  
  _sync : function (method, url, specific_data)
  {
//     var params = {}, data = '';
// 
//     // Ensure that we have the appropriate request data.
//     if (method == 'POST' || method == 'PUT')
//     {
//       this._xhr.contentType = 'application/json';
//       if (!specific_data)
//       { data = this.toJSON (); }
//       else
//       { data = specific_data; }
//     }
// 
//     this._xhr.method = method;
//     this._xhr.url = url;
// 
//     // Make the request.
//     this._xhr.send (data);
  },
  
  /**
   * processes the received rss xml
   *
   * @name vs.data.RSSRequester#processRSS 
   * @function
   *
   * @private
   * @param Text rsstxt 
   * @param Document rssxml 
   */
  _processResult : function (event)
  {
    var data = event.data, xhr = event.src;
    var model_name = this._xhrs [xhr.id];
    xhr.unbind ('textload', this, this._processResult);
    vs.util.free (xhr);
    delete (this._xhrs [xhr.id]);
    
    if (!data)
    {
      console.error ("Failed to parse rss document that is null.");
      return false;
    }
    
    var model = this.__models__ [model_name];
    if (!model) return;
    
    model.parseJSON (data);
    this.propagate ('load', model);
  }
};
vs.util.extendClass (RestStorage, DataStorage);

/********************************************************************
                  Define class properties
********************************************************************/

vs.util.defineClassProperties (RestStorage, {
  "url": {
    /** 
     * Setter for the url
     * @name vs.core.RestStorage#url 
     * @type String
     */ 
    set : function (v)
    {
      if (!vs.util.isString (v)) { return; }
      
      this._url = v;
    },

    /** 
     * Getter for the url
     * @name vs.core.RestStorage#url 
     * @type String
     */ 
    get : function (v)
    {
      return this._url;
    }
  }
});

/********************************************************************
                      Export
*********************************************************************/
/** @private */
vs.core.RestStorage = RestStorage;
