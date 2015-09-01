$(document).on('ready', function(){


  var Guide = React.createClass({
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
          <div className="splash">
            <h1> Welcome </h1>
            <h4> Pick a guide, then: </h4>
            <h5> Quickly find information by picking a column to search </h5>

          </div>
      } else if (this.state.currentTable === 'error') {
        lowerRegion = 'Oops, there was an error!';
      } else {
        lowerRegion = <SearchableTable
          sortingFieldIndex={this.state.sortingFieldIndex}
          sortAscending={this.state.sortAscending}
          setSorting={this.setSorting}
          guideData={this.data[this.state.currentTable]}
          setSearchText={this.setSearchText}
          toggleSearchField={this.toggleSearchField}
          searchText={this.state.searchText}
          enabledFields={this.state.enabledFields}/>
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
            sortingFieldIndex={this.props.sortingFieldIndex}
            setSorting={this.props.setSorting}
            guideData={this.props.guideData}
            toggleSearchField={this.props.toggleSearchField}
            searchText={this.props.searchText}
            enabledFields={this.props.enabledFields}
            sortAscending={this.props.sortAscending}/>
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
            className="form-control search-input"
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

    handleInput: function(index) {
      this.props.toggleSearchField(index);
    },

    render: function() {
      var fieldButtons = [];

      this.props.fields.forEach(function(field, index){
        var isActive = this.props.enabledFields[index];

        var activeClass = isActive ? ' selected' : '';

        fieldButtons.push(
          <th
            className={"field-selecting-th"+activeClass}
            key={field.name}
            onClick={this.handleInput.bind(this, index)}
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
          <TableRow
            key={key}
            fields={this.props.guideData.fields}
            row={row} />
        );
      }.bind(this));


      return(
        <table className="table table-hover table-condensed">
          <TableHeader
            sortingFieldIndex={this.props.sortingFieldIndex}
            setSorting={this.props.setSorting}
            enabledFields={this.props.enabledFields}
            fields={this.props.guideData.fields}
            toggleSearchField={this.props.toggleSearchField}
            sortAscending={this.props.sortAscending}/>
          <tbody>
            {tableRows}
          </tbody>
        </table>
      )
    }
  });


  var TableHeader = React.createClass({
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
            <i className="fa fa-caret-up"></i> :
            <i className="fa fa-caret-down"></i>;
        }
        headers.push(
          <th
            title={field.tip}
            className="clickable-header"
            key={field.name}
            onClick={this.handleSortSelect.bind(this, index)}
            data-field-name={field.name}>
            {field.name} {sortingArrow}
          </th>
        )

      }.bind(this));

      return(
        <thead>
          <tr>
            <SearchFieldSelect
              enabledFields={this.props.enabledFields}
              fields={this.props.fields}
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
