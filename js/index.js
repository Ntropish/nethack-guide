$(document).on('ready', function(){


  var Guide = React.createClass({displayName: "Guide",
    getInitialState: function() {

      return {
        currentTable: 'default',
        searchText: '',
        searchFields: [],
        sorting: {field: '', ascending: false}
      };
    },
    componentDidMount: function() {
      $.ajax({
        url: './data.json',
        dataType: 'json',
        success: function(response){
          this.data = response;
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
      this.setState({currentTable: tableName});

      // Get search fields for the table and update
      this.setState({searchFields: this.data[tableName].fields});

      // Clear search text
      this.setSearchText('');

      // Set default sorting
      this.setSorting({
        field: this.data[tableName].fields[0].name,
        ascending: false,
        sort: this.data[tableName].fields[0].sort});
    },

    setSearchText: function(text){
      this.setState({searchText: text});
    },

    toggleSearchField: function(fieldName) {

      var fieldIndex = this.state.searchFields.map(function(field){
          return field.name;
        }).indexOf(fieldName);

      if (fieldIndex === -1) {
        throw new Error("Field not found.");
      }

      this.setState(function(oldState){
        var field = oldState.searchFields[fieldIndex];
        field.activeSearchField = !field.activeSearchField;
        return {searchFields: oldState.searchFields};
      });
    },

    setSorting: function(sorting) {
      this.setState({sorting: sorting});
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
          sorting: this.state.sorting, 
          setSorting: this.setSorting, 
          guideData: this.data[this.state.currentTable], 
          searchBarText: this.state.searchBarText, 
          setSearchText: this.setSearchText, 
          toggleSearchField: this.toggleSearchField, 
          searchText: this.state.searchText, 
          searchFields: this.state.searchFields})
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
            sorting: this.props.sorting, 
            setSorting: this.props.setSorting, 
            guideData: this.props.guideData, 
            toggleSearchField: this.props.toggleSearchField, 
            searchText: this.props.searchText, 
            searchFields: this.props.searchFields})
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
            className: "form-control", 
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

    handleInput: function(fieldName) {
      this.props.toggleSearchField(fieldName);
    },

    render: function() {
      var fieldButtons = [];

      this.props.searchFields.forEach(function(field){
        var isActive = field.activeSearchField;

        var activeClass = isActive ? ' selected' : '';

        fieldButtons.push(
          React.createElement("th", {
            className: "field-selecting-th"+activeClass, 
            key: field.name, 
            onClick: this.handleInput.bind(this, field.name), 
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
        return  rows.sort(function(a, b){
          var one = $('<span>'+a[this.props.sorting.field]+'</span>').text();
          var two = $('<span>'+b[this.props.sorting.field]+'</span>').text();

          if (one && !two) {
            if (this.props.sorting.ascending) {
              return 1;
            } else {
              return -1;
            }
          }

          if (two && !one) {
            if (this.props.sorting.ascending) {
              return -1;
            } else {
              return 1;
            }
          }

          if (!one && !two) {
            return 0;
          }

          if (this.props.sorting.sort === 'numeric') {

            var oneNumber = +(one.match(/\d+/)[0]);
            var twoNumber = +(two.match(/\d+/)[0]);
            if (this.props.sorting.ascending) {
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
          } else if (this.props.sorting.sort === 'alpha') {
            if (this.props.sorting.ascending) {
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

          fieldLoop: for (j = 0, m = this.props.searchFields.length; j<m; j++) {
            field = this.props.searchFields[j];
            if (!(field.activeSearchField)) {
              continue fieldLoop;
            }

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

      var tableRows = [];

      var rows = sortRows.call(this, this.props.guideData.rows);

      if (this.props.searchText) {
        rows = cullRows.call(this, rows);
      }

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
            sorting: this.props.sorting, 
            setSorting: this.props.setSorting, 
            searchFields: this.props.searchFields, 
            toggleSearchField: this.props.toggleSearchField}), 
          React.createElement("tbody", null, 
            tableRows
          )
        )
      )
    }
  });


  var TableHeader = React.createClass({displayName: "TableHeader",
    handleSortSelect: function(field, sort) {

      var sorting = this.props.sorting;

      if (sorting.field !== field) {
        this.props.setSorting({field: field, ascending: false, sort: sort});
      } else if (!sorting.ascending) {
        this.props.setSorting({field: field, ascending: true, sort: sort});
      } else {
        this.props.setSorting({field: field, ascending: false, sort: sort});
      }

    },
    render: function() {
      var headers = [];

      this.props.searchFields.forEach(function(field){
        var sortingArrow = '';
        if (field.name === this.props.sorting.field) {
          sortingArrow = this.props.sorting.ascending ?
            React.createElement("i", {className: "fa fa-caret-up"}) :
            React.createElement("i", {className: "fa fa-caret-down"});
        }
        headers.push(
          React.createElement("th", {
            className: "clickable-header", 
            key: field.name, 
            onClick: this.handleSortSelect.bind(this, field.name, field.sort), 
            "data-field-name": field.name}, 
            field.name, " ", sortingArrow
          )
        )

      }.bind(this));

      return(
        React.createElement("thead", null, 
          React.createElement("tr", null, 
            React.createElement(SearchFieldSelect, {
              searchFields: this.props.searchFields, 
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
