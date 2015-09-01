$(document).on('ready', function(){


  var Guide = React.createClass({displayName: "Guide",
    setHash: function(isNewHistoryState){

      var enabledFieldsString = '';
      this.state.enabledFields.forEach(function(enabled){
        enabledFieldsString += (enabled ? '1' : '0');
      });

      var hash = '#' + [
        this.state.currentTable,
        this.state.searchText,
        enabledFieldsString,
        this.state.sortingFieldIndex,
        this.state.sortAscending
      ].join('--');

      if (isNewHistoryState) {
        history.pushState({}, "Nethack "+this.state.currentTable, hash);
      } else {
        history.replaceState({}, "Nethack "+this.state.currentTable, hash);
      }

    },
    loadHash: function(){
      var hashValues = window.location.hash.slice(1).split('--');

      if (hashValues.length !== 5) {
        // Cancel load if the data is obviously incorrect
        return;
      }

      var enabledFields = hashValues[2].split('').map(function(character){
        if (character === '1') {
          return true;
        }
        return false;
      });

      this.setState({
        currentTable: hashValues[0],
        searchText: hashValues[1],
        enabledFields: enabledFields,
        sortingFieldIndex: hashValues[3],
        sortAscending: (hashValues[4] === 'true') ? true : false
      });
    },
    getInitialState: function() {

      return {
        currentTable: 'default',
        searchText: '',
        enabledFields: [],
        sortingFieldIndex: 0,
        sortAscending: false
      };
    },
    componentDidMount: function() {
      this.data = {
        commands: {}
      };
      $.ajax({
        url: './json/data.json',
        dataType: 'json',
        success: function(response){

          // Setup this event handler now, after data has loaded successfully
          $(window).on('hashchange', this.loadHash);

          this.data = response;

          // Load any hash now that the data is loaded
          this.loadHash();

        }.bind(this),
        error: function(){
          console.log('Error getting data!');
        }.bind(this)
      });

    },
    changeTable: function(tableName) {

      if ( // Check for errors in the data (nonexistance)
        !this.data[tableName]
        ||
        !this.data[tableName].fields[0]
      ) {
        this.setState({currentTable: 'error'});
        return;
      }


      // No errors so procede with transition

      this.setState({
        currentTable: tableName,
        enabledFields: this.data[tableName].fields.map(function(){return true;})
      }, this.setHash.bind(this, true));

    },

    setSearchText: function(text){

      //Remove separator used in hash
      text = text.replace(/--/g, '-');

      this.setState({searchText: text}, this.setHash.bind(this, false));
    },

    toggleSearchField: function(index) {
      this.setState(function(oldState){
        oldState.enabledFields[index] = !oldState.enabledFields[index];
        return {searchFields: oldState.enabledFields};
      }, this.setHash.bind(this, false));
    },

    setSorting: function(index, ascending) {
      this.setState(
        {sortingFieldIndex: index, sortAscending: ascending},
        this.setHash.bind(this, false));
    },

    render: function() {
      var lowerRegion;
      if (this.state.currentTable === 'default') {
        lowerRegion =
          React.createElement("div", {className: "splash"}, 
            React.createElement("h1", null, " Welcome "), 
            React.createElement("h4", null, " Pick a guide, then: "), 
            React.createElement("h5", null, " Quickly find information by picking a column to search ")

          )
      } else if (this.state.currentTable === 'error') {
        lowerRegion = 'Oops, there was an error!';
      } else {
        lowerRegion = React.createElement(SearchableTable, {
          sortingFieldIndex: this.state.sortingFieldIndex, 
          sortAscending: this.state.sortAscending, 
          setSorting: this.setSorting, 
          guideData: this.data[this.state.currentTable], 
          setSearchText: this.setSearchText, 
          toggleSearchField: this.toggleSearchField, 
          searchText: this.state.searchText, 
          enabledFields: this.state.enabledFields})
      }
      var header;
      if (this.data && this.data[this.state.currentTable]) {
        header =
        React.createElement("div", {className: "table-header"}, 
          React.createElement("h3", null, this.data[this.state.currentTable].header.title), 
          React.createElement("a", {href: this.data[this.state.currentTable].header.source}, 
            React.createElement("h5", null, "Source at ", this.data[this.state.currentTable].header.sourceName)
          )
        )
      }

      return(
        React.createElement("div", null, 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "guide-select btn-group btn-group-justified"}, 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {
                  onClick: this.changeTable.bind(this, 'commands'), 
                  className: "btn"}, "Commands")
              ), 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {
                  onClick: this.changeTable.bind(this, 'corpses'), 
                  className: "btn"}, "Corpses")
              ), 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {
                  onClick: this.changeTable.bind(this, 'monsters'), 
                  className: "btn"}, "Monsters")
              )
            )
          ), 
          header, 
          React.createElement("div", {className: "row"}, 
            lowerRegion
          )
        )
      )
    }
  });



  var SearchableTable = React.createClass({displayName: "SearchableTable",
    render: function() {
      return(
        React.createElement("div", {className: "col-lg-12"}, 
          React.createElement(SearchBar, {
          setSearchText: this.props.setSearchText, 
          searchText: this.props.searchText}), 
          React.createElement(Table, {
            sortingFieldIndex: this.props.sortingFieldIndex, 
            setSorting: this.props.setSorting, 
            guideData: this.props.guideData, 
            toggleSearchField: this.props.toggleSearchField, 
            searchText: this.props.searchText, 
            enabledFields: this.props.enabledFields, 
            sortAscending: this.props.sortAscending})
        )
      )
    }
  });


  var SearchBar = React.createClass({displayName: "SearchBar",
    handleInput: function() {
      this.props.setSearchText(
        this.refs.searchInput.getDOMNode().value
      );
    },
    clearInput: function() {
      this.props.setSearchText('');
    },
    render: function() {
      return(
        React.createElement("div", {className: "input-group"}, 

          React.createElement("input", {
            className: "form-control search-input", 
            type: "text", 
            placeholder: "Search...", 
            ref: "searchInput", 
            value: this.props.searchText, 
            onChange: this.handleInput}), 

            React.createElement("span", {className: "input-group-btn"}, 
              React.createElement("button", {
                className: "btn btn-danger", 
                type: "button", 
                onClick: this.clearInput}, "Clear")
            )

        )
      )
    }
  });


  var SearchFieldSelect = React.createClass({displayName: "SearchFieldSelect",

    handleInput: function(index) {
      this.props.toggleSearchField(index);
    },

    render: function() {
      var fieldButtons = [];

      this.props.fields.forEach(function(field, index){
        var isActive = this.props.enabledFields[index];

        var activeClass = isActive ? ' selected' : '';

        fieldButtons.push(
          React.createElement("th", {
            className: "field-selecting-th"+activeClass, 
            key: field.name, 
            onClick: this.handleInput.bind(this, index), 
            "data-field-name": field.name}, 
            React.createElement("div", null, 
              "Search This"
            )
          )
        )
      }.bind(this));

      return(
        React.createElement("div", null, 
          React.createElement("tr", null, 
            fieldButtons
          )
        )
      )
    }
  });


  var Table = React.createClass({displayName: "Table",
    render: function() {


      function sortRows(rows) {
        var sortField = this.props.guideData.fields[this.props.sortingFieldIndex].name;
        var sortType = this.props.guideData.fields[this.props.sortingFieldIndex].sort;

        return  rows.sort(function(a, b){
          var one = $(
            '<span>'+
            a[sortField]+
            '</span>').text();
          var two = $(
            '<span>'+
            b[sortField]+
            '</span>').text();

          if (one && !two) {
            if (this.props.sortAscending) {
              return 1;
            } else {
              return -1;
            }
          }

          if (two && !one) {
            if (this.props.sortAscending) {
              return -1;
            } else {
              return 1;
            }
          }

          if (!one && !two) {
            return 0;
          }

          if (sortType === 'numeric') {

            var oneNumber = +(one.match(/\d+/)[0]);
            var twoNumber = +(two.match(/\d+/)[0]);
            if (this.props.sortAscending) {
              if (oneNumber > twoNumber) {
                return 1;
              } else {
                return -1;
              }
            } else {
              if (oneNumber > twoNumber) {
                return -1;
              } else {
                return 1;
              }
            }
          } else if (sortType === 'alpha') {
            if (this.props.sortAscending) {
              return two.localeCompare(one);
            } else {
              return one.localeCompare(two);
            }
          } else {
            return 0;
          }


        }.bind(this));
      };

      function cullRows(rows) {
        var result = [];
        var i;
        var row;


        rowLoop: for (i = 0, l = rows.length; i<l; i++) {
          row = rows[i];

          fieldLoop: for (j = 0, m = this.props.guideData.fields.length; j<m; j++) {

            if (!(this.props.enabledFields[j])) {
              continue fieldLoop;
            }

            field = this.props.guideData.fields[j];

            var text = $('<span>'+row[field.name]+'</span>').text();
            var query = this.props.searchText;

            if (field.searchType === 'insensitive') {
              text = text.toLowerCase();
              query = query.toLowerCase();
            }

            if (text.indexOf(query) !== -1) {
              result.push(row);
              continue rowLoop;
            }

          }


        }
        return result;
      };

      var tableRows = []; // To be used in the table

      var rows = this.props.guideData.rows;

      if (this.props.searchText) {
        rows = cullRows.call(this, rows);
      }

      rows = sortRows.call(this, rows);

      rows.forEach(function(row){
        // Use the first field as the key, and the second if it exists
        var key = row[this.props.guideData.fields[0].name] +
          (this.props.guideData.fields[1] ?
          row[this.props.guideData.fields[1].name] :
          '');

        tableRows.push(
          React.createElement(TableRow, {
            key: key, 
            fields: this.props.guideData.fields, 
            row: row})
        );
      }.bind(this));


      return(
        React.createElement("table", {className: "table table-hover table-condensed"}, 
          React.createElement(TableHeader, {
            sortingFieldIndex: this.props.sortingFieldIndex, 
            setSorting: this.props.setSorting, 
            enabledFields: this.props.enabledFields, 
            fields: this.props.guideData.fields, 
            toggleSearchField: this.props.toggleSearchField, 
            sortAscending: this.props.sortAscending}), 
          React.createElement("tbody", null, 
            tableRows
          )
        )
      )
    }
  });


  var TableHeader = React.createClass({displayName: "TableHeader",
    handleSortSelect: function(index) {

      if (this.props.sortingFieldIndex !== index) {
        this.props.setSorting(index, false);
      } else if (!this.props.sortAscending) {
        this.props.setSorting(index, true);
      } else {
        this.props.setSorting(index, false);
      }

    },
    render: function() {
      var headers = [];

      this.props.fields.forEach(function(field, index){
        var sortingArrow = '';
        if (index === this.props.sortingFieldIndex) {
          sortingArrow = this.props.sortAscending ?
            React.createElement("i", {className: "fa fa-caret-up"}) :
            React.createElement("i", {className: "fa fa-caret-down"});
        }
        headers.push(
          React.createElement("th", {
            title: field.tip, 
            className: "clickable-header", 
            key: field.name, 
            onClick: this.handleSortSelect.bind(this, index), 
            "data-field-name": field.name}, 
            field.name, " ", sortingArrow
          )
        )

      }.bind(this));

      return(
        React.createElement("thead", null, 
          React.createElement("tr", null, 
            React.createElement(SearchFieldSelect, {
              enabledFields: this.props.enabledFields, 
              fields: this.props.fields, 
              toggleSearchField: this.props.toggleSearchField})
          ), 
          React.createElement("tr", null, 
            headers
          )
        )
      )
    }
  });


  var TableRow = React.createClass({displayName: "TableRow",
    render: function() {
      return(
        // Use the first field in the row as the unique key
        React.createElement("tr", {key: this.props.row[this.props.fields[0].name]}, 
          
            this.props.fields.map(function(field){
              return React.createElement("td", {key: field.name, dangerouslySetInnerHTML: {__html: this.props.row[field.name]}});
            }.bind(this))
          
        )
      )
    }
  });




  React.render(
    React.createElement(Guide, null),
    document.getElementById('content')
  );
});
