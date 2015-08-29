$(document).on('ready', function(){


  var Guide = React.createClass({displayName: "Guide",
    getInitialState: function() {

      var data = {
        monsters: {},
        commands: {},
        corpses:  {}
      };

      return {
        currentTable: 'default',
        data: data,
        searchText: '',
        searchField: '',
        sorting: {field: '', ascending: true}
      };
    },
    componentDidMount: function() {
      $.ajax({
        url: '/data.json',
        dataType: 'json',
        success: function(response){
          this.setState({data: response});
        }.bind(this),
        error: function(){
          console.log('Error getting data!');
        }.bind(this)
      });

    },
    changeTable: function(e) {
      e.preventDefault();
      var table = e.target.getAttribute('data-guide');

      if ( // Check for errors in the data (nonexistance)
        !this.state.data[table]
        ||
        !this.state.data[table].fields[0]
      ) {
        this.setState({currentTable: 'error'});
        return;
      }
      // No errors so procede with transition
      this.setState({currentTable: table});

      // Set default field when switching to be the first field
      this.setSearchField(this.state.data[table].fields[0].name);

      // Clear search text
      this.setSearchText('');

      // Set default sorting
      this.setSorting({
        field: this.state.data[table].fields[0].name,
        ascending: true});
    },
    setSearchText: function(text){
      this.setState({searchText: text});
    },
    setSearchField: function(fieldName) {
      this.setState({searchField: fieldName});
    },
    setSorting: function(sorting) {
      this.setState({sorting: sorting});
    },
    render: function() {
      var lowerRegion;
      if (this.state.currentTable === 'default') {
        lowerRegion = 'Welcome to this guide!';
      } else if (this.state.currentTable === 'error') {
        lowerRegion = 'Oops, there was an error!';
      } else {
        lowerRegion = React.createElement(SearchableTable, {
          sorting: this.state.sorting, 
          setSorting: this.setSorting, 
          guideData: this.state.data[this.state.currentTable], 
          searchBarText: this.state.searchBarText, 
          setSearchText: this.setSearchText, 
          setSearchField: this.setSearchField, 
          searchText: this.state.searchText, 
          searchField: this.state.searchField})
      }
      return(
        React.createElement("div", null, 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "guide-select btn-group btn-group-justified"}, 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {
                  onClick: this.changeTable, 
                  "data-guide": "commands", 
                  className: "btn"}, "Commands")
              ), 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {
                  onClick: this.changeTable, 
                  "data-guide": "corpses", 
                  className: "btn"}, "Corpses")
              ), 
              React.createElement("div", {className: "btn-group"}, 
                React.createElement("button", {
                  onClick: this.changeTable, 
                  "data-guide": "monsters", 
                  className: "btn"}, "Monsters")
              )
            )
          ), 
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
        React.createElement("div", {className: "col-lg-8"}, 
          React.createElement(SearchBar, {
          setSearchText: this.props.setSearchText, 
          searchText: this.props.searchText}), 
          React.createElement(Table, {
            sorting: this.props.sorting, 
            setSorting: this.props.setSorting, 
            guideData: this.props.guideData, 
            setSearchField: this.props.setSearchField, 
            searchText: this.props.searchText, 
            searchField: this.props.searchField})
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
    handleInput: function(e) {
      e.preventDefault();
      this.props.setSearchField(
        e.target.getAttribute('data-field-name')
      );
    },
    render: function() {
      var fieldButtons = [];

      this.props.fields.forEach(function(field){
        var isActive = field.name === this.props.searchField;
        var activeFieldSelect = isActive ? ' caved-in' : ''
        var content = isActive ? React.createElement("i", {className: "fa fa-chevron-down"}) :
          'Search by...';
        fieldButtons.push(
          React.createElement("th", {
            className: "field-selecting-th"+activeFieldSelect, 
            key: field.name, 
            onClick: this.handleInput, 
            "data-field-name": field.name}, 
            content
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

      var tableRows = [];

      this.props.guideData.rows
        .sort(function(a, b){
          if (this.props.sorting.ascending) {
            return a[this.props.sorting.field] > b[this.props.sorting.field];
          } else {
            return a[this.props.sorting.field] < b[this.props.sorting.field];
          }
        }.bind(this))
        .forEach(function(row){
        // Cull out rows that don't match the search
        if (
              this.props.searchText
              &&
              row[this.props.searchField].indexOf(this.props.searchText) === -1
            ) {
          return;
        };

        tableRows.push(
          React.createElement(TableRow, {
            key: row[this.props.guideData.fields[0].name], 
            fields: this.props.guideData.fields, 
            row: row})
        );
      }.bind(this));

      return(
        React.createElement("table", {className: "table table-hover table-condensed"}, 
          React.createElement(TableHeader, {
            sorting: this.props.sorting, 
            setSorting: this.props.setSorting, 
            searchField: this.props.searchField, 
            setSearchField: this.props.setSearchField, 
            fields: this.props.guideData.fields}), 
          React.createElement("tbody", null, 
            tableRows
          )
        )
      )
    }
  });


  var TableHeader = React.createClass({displayName: "TableHeader",
    handleSortSelect: function(e) {
      var field = e.target.getAttribute('data-field-name');
      var sorting = this.props.sorting;

      if (sorting.field !== field) {
        this.props.setSorting({field: field, ascending: true});
      } else if (sorting.ascending) {
        this.props.setSorting({field: field, ascending: false});
      } else {
        this.props.setSorting({field: field, ascending: true});
      }

    },
    render: function() {
      var headers = [];

      this.props.fields.forEach(function(field){
        var sortingArrow = '';
        if (field.name === this.props.sorting.field) {
          sortingArrow = this.props.sorting.ascending ?
            React.createElement("i", {className: "fa fa-caret-down"}) :
            React.createElement("i", {className: "fa fa-caret-up"});
        }
        headers.push(
          React.createElement("th", {
            className: "clickable-header", 
            key: field.name, 
            onClick: this.handleSortSelect, 
            "data-field-name": field.name}, 
            field.name, " ", sortingArrow
          )
        )

      }.bind(this));

      return(
        React.createElement("thead", null, 
          React.createElement("tr", null, 
            React.createElement(SearchFieldSelect, {
              searchField: this.props.searchField, 
              setSearchField: this.props.setSearchField, 
              fields: this.props.fields})
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
              return React.createElement("td", {key: field.name}, this.props.row[field.name]);
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