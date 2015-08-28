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
        SearchText: '',
        SearchField: ''
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
    },
    setSearchText: function(text){
      this.setState({searchText: text});
    },
    setSearchField: function(fieldName) {
      this.setState({searchField: fieldName});
    },
    render: function() {
      var lowerRegion;
      if (this.state.currentTable === 'default') {
        lowerRegion = 'Welcome to this guide!';
      } else if (this.state.currentTable === 'error') {
        lowerRegion = 'Oops, there was an error!';
      } else {
        lowerRegion = <SearchableTable
          guideData={this.state.data[this.state.currentTable]}
          searchBarText={this.state.searchBarText}
          setSearchText={this.setSearchText}
          setSearchField={this.setSearchField}
          searchText={this.state.searchText}
          searchField={this.state.searchField}/>
      }


      return(
        <div>
          <button onClick={this.changeTable} data-guide="commands">Commands</button>
          <button onClick={this.changeTable} data-guide="corpses">Corpses</button>
          <button onClick={this.changeTable} data-guide="monsters">Monsters</button>
          {lowerRegion}
        </div>
      )
    }
  });



  var SearchableTable = React.createClass({
    render: function() {
      return(
        <div>
          <SearchBar
          setSearchText={this.props.setSearchText}
          searchText={this.props.searchText}/>
          <Table
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
    render: function() {
      return(
        <input
          type="text"
          placeholder="Search..."
          ref="searchInput"
          value={this.props.searchText}
          onChange={this.handleInput}/>
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
        fieldButtons.push(
          <th key={field.name}>
            <button
              onClick={this.handleInput}
              data-field-name={field.name}>
              {field.name}
            </button>
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

      this.props.guideData.rows.forEach(function(row){
        // Cull out rows that don't match the search
        if (
              this.props.searchText
              &&
              row[this.props.searchField].indexOf(this.props.searchText) === -1
            ) {
          return;
        };

        tableRows.push(
          <TableRow
            key={row[this.props.guideData.fields[0].name]}
            fields={this.props.guideData.fields}
            row={row} />
        );
      }.bind(this));

      return(
        <table>
          <TableHeader
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
    render: function() {
      var headers = [];

      this.props.fields.forEach(function(field){
        headers.push(
          <th key={field.name}>
            {field.name}
          </th>
        )

      }.bind(this));

      return(
        <thead>
          <tr>
            <SearchFieldSelect
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
              return <td key={field.name}>{this.props.row[field.name]}</td>;
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
