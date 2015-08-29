$(document).on('ready', function(){


  var Guide = React.createClass({
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
        sorting: {field: '', ascending: false}
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
        ascending: false,
        sort: this.state.data[table].fields[0].sort});
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
        lowerRegion = <SearchableTable
          sorting={this.state.sorting}
          setSorting={this.setSorting}
          guideData={this.state.data[this.state.currentTable]}
          searchBarText={this.state.searchBarText}
          setSearchText={this.setSearchText}
          setSearchField={this.setSearchField}
          searchText={this.state.searchText}
          searchField={this.state.searchField}/>
      }
      var header;
      if (this.state.data[this.state.currentTable]) {
        header =
        <div className="table-header">
          <h3>{this.state.data[this.state.currentTable].header.title}</h3>
          <a href={this.state.data[this.state.currentTable].header.source}>
            <h5>Source at {this.state.data[this.state.currentTable].header.sourceName}</h5>
          </a>
        </div>
      }

      return(
        <div>
          <div className="row">
            <div className="guide-select btn-group btn-group-justified">
              <div className="btn-group">
                <button
                  onClick={this.changeTable}
                  data-guide="commands"
                  className="btn">Commands</button>
              </div>
              <div className="btn-group">
                <button
                  onClick={this.changeTable}
                  data-guide="corpses"
                  className="btn">Corpses</button>
              </div>
              <div className="btn-group">
                <button
                  onClick={this.changeTable}
                  data-guide="monsters"
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
            setSearchField={this.props.setSearchField}
            searchText={this.props.searchText}
            searchField={this.props.searchField}/>
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
        var content = isActive ? <i className="fa fa-chevron-down"></i> :
          'Search by...';
        fieldButtons.push(
          <th
            className={"field-selecting-th"+activeFieldSelect}
            key={field.name}
            onClick={this.handleInput}
            data-field-name={field.name}>
            {content}
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

      var tableRows = [];

      this.props.guideData.rows
        .sort(function(a, b){
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
          } else if (this.props.sorting.sort === 'none') {
            return 0;
          }

          if (this.props.sorting.ascending) {
            return two.localeCompare(one);
          } else {
            return one.localeCompare(two);
          }
        }.bind(this))
        .forEach(function(row){
        // Cull out rows that don't match the search
        if (
              this.props.searchText
              &&
              // Parse out html text and check for search string
              $('<span>'+row[this.props.searchField]+'</span>').text()
                .indexOf(this.props.searchText) === -1
            ) {
          return;
        };

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
            searchField={this.props.searchField}
            setSearchField={this.props.setSearchField}
            fields={this.props.guideData.fields}/>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      )
    }
  });


  var TableHeader = React.createClass({
    handleSortSelect: function(field, sort) {
      //e.preventDefault();

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

      this.props.fields.forEach(function(field){
        var sortingArrow = '';
        if (field.name === this.props.sorting.field) {
          sortingArrow = this.props.sorting.ascending ?
            <i className="fa fa-caret-uo"></i> :
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
              searchField={this.props.searchField}
              setSearchField={this.props.setSearchField}
              fields={this.props.fields}/>
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
