$(document).on('ready', function(){


  var Guide = React.createClass({
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
          <div className="splash">
            <h1> Welcome </h1>
            <h4> Pick a guide, then: </h4>
            <h5> Quickly find information by picking a column to search </h5>

          </div>
      } else if (this.state.currentTable === 'error') {
        lowerRegion = 'Oops, there was an error!';
      } else {
        lowerRegion = <SearchableTable
          sorting={this.state.sorting}
          setSorting={this.setSorting}
          guideData={this.data[this.state.currentTable]}
          searchBarText={this.state.searchBarText}
          setSearchText={this.setSearchText}
          toggleSearchField={this.toggleSearchField}
          searchText={this.state.searchText}
          searchFields={this.state.searchFields}/>
      }
      var header;
      if (this.data && this.data[this.state.currentTable]) {
        header =
        <div className="table-header">
          <h3>{this.data[this.state.currentTable].header.title}</h3>
          <a href={this.data[this.state.currentTable].header.source}>
            <h5>Source at {this.data[this.state.currentTable].header.sourceName}</h5>
          </a>
        </div>
      }

      return(
        <div>
          <div className="row">
            <div className="guide-select btn-group btn-group-justified">
              <div className="btn-group">
                <button
                  onClick={this.changeTable.bind(this, 'commands')}
                  className="btn">Commands</button>
              </div>
              <div className="btn-group">
                <button
                  onClick={this.changeTable.bind(this, 'corpses')}
                  className="btn">Corpses</button>
              </div>
              <div className="btn-group">
                <button
                  onClick={this.changeTable.bind(this, 'monsters')}
                  className="btn">Monsters</button>
              </div>
            </div>
          </div>
          {header}
          <div className="row">
            {lowerRegion}
          </div>
        </div>
      )
    }
  });



  var SearchableTable = React.createClass({
    render: function() {
      return(
        <div className="col-lg-12">
          <SearchBar
          setSearchText={this.props.setSearchText}
          searchText={this.props.searchText}/>
          <Table
            sorting={this.props.sorting}
            setSorting={this.props.setSorting}
            guideData={this.props.guideData}
            toggleSearchField={this.props.toggleSearchField}
            searchText={this.props.searchText}
            searchFields={this.props.searchFields}/>
        </div>
      )
    }
  });


  var SearchBar = React.createClass({
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
        <div className="input-group">

          <input
            className="form-control"
            type="text"
            placeholder="Search..."
            ref="searchInput"
            value={this.props.searchText}
            onChange={this.handleInput}/>

            <span className="input-group-btn">
              <button
                className="btn btn-danger"
                type="button"
                onClick={this.clearInput}>Clear</button>
            </span>

        </div>
      )
    }
  });


  var SearchFieldSelect = React.createClass({

    handleInput: function(fieldName) {
      this.props.toggleSearchField(fieldName);
    },

    render: function() {
      var fieldButtons = [];

      this.props.searchFields.forEach(function(field){
        var isActive = field.activeSearchField;

        var activeClass = isActive ? ' selected' : '';

        fieldButtons.push(
          <th
            className={"field-selecting-th"+activeClass}
            key={field.name}
            onClick={this.handleInput.bind(this, field.name)}
            data-field-name={field.name}>
            <div>
              Search This
            </div>
          </th>
        )
      }.bind(this));

      return(
        <div>
          <tr>
            {fieldButtons}
          </tr>
        </div>
      )
    }
  });


  var Table = React.createClass({
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
          <TableRow
            key={key}
            fields={this.props.guideData.fields}
            row={row} />
        );
      }.bind(this));


      return(
        <table className="table table-hover table-condensed">
          <TableHeader
            sorting={this.props.sorting}
            setSorting={this.props.setSorting}
            searchFields={this.props.searchFields}
            toggleSearchField={this.props.toggleSearchField}/>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      )
    }
  });


  var TableHeader = React.createClass({
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
            <i className="fa fa-caret-up"></i> :
            <i className="fa fa-caret-down"></i>;
        }
        headers.push(
          <th
            className="clickable-header"
            key={field.name}
            onClick={this.handleSortSelect.bind(this, field.name, field.sort)}
            data-field-name={field.name}>
            {field.name} {sortingArrow}
          </th>
        )

      }.bind(this));

      return(
        <thead>
          <tr>
            <SearchFieldSelect
              searchFields={this.props.searchFields}
              toggleSearchField={this.props.toggleSearchField}/>
          </tr>
          <tr>
            {headers}
          </tr>
        </thead>
      )
    }
  });


  var TableRow = React.createClass({
    render: function() {
      return(
        // Use the first field in the row as the unique key
        <tr key={this.props.row[this.props.fields[0].name]}>
          {
            this.props.fields.map(function(field){
              return <td key={field.name} dangerouslySetInnerHTML={{__html: this.props.row[field.name]}} />;
            }.bind(this))
          }
        </tr>
      )
    }
  });




  React.render(
    <Guide />,
    document.getElementById('content')
  );
});
