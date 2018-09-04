import BaseView = require('pimenrich/js/view/base')
import * as _ from 'underscore'

const mediator = require('oro/mediator')
const requireContext = require('require-context')

class FiltersColumn extends BaseView {
  public modules: any
  public datagridCollection: any

  public config = {
    filterTypes: {
        string: 'choice',
        choice: 'select',
        selectrow: 'select-row',
        multichoice: 'multiselect',
        boolean: 'select'
    }
  }

  constructor(options: {config: any}) {
    super(options)

    this.config = {...this.config, ...options.config}
    this.modules = {}
    this.datagridCollection = null;
  }

  configure() {
    this.listenTo(mediator, 'datagrid_collection_set_after', (gridCollection: any, gridElement: any) => {
      const datagrid = $(gridElement).data()
      const filters = datagrid.metadata.filters.map(filter => {
        filter.enabled = true
        return filter
      })

      this.renderFilters(filters, gridCollection)
    });

    this.listenTo(mediator, 'filters-column:update-filters', this.renderFilters)

    return BaseView.prototype.configure.apply(this, arguments)
  }

  getFilterModule(filter: any) {
    const types: any = this.config.filterTypes
    const filterType = types[filter.type] || filter.type
    let cachedFilter = this.modules[filter.name]

    if (!cachedFilter) {
      const filterModule = requireContext(`oro/datafilter/${filterType}-filter`)
      return this.modules[filter.name] = new (filterModule.extend(filter))(filter);
    }

    return cachedFilter
  }

  renderFilters(filters: any, datagridCollection: any) {
    this.datagridCollection = datagridCollection
    const list = document.createDocumentFragment();
    const state = datagridCollection.state.filters

    filters.forEach((filter) => {
      const filterModule =  this.getFilterModule(filter)

      if (true === filter.enabled) {
        filterModule.render()
        filterModule.on('update', this.updateDatagridStateWithFilters.bind(this))
        filterModule.on('disable', this.updateDatagridStateWithFilters.bind(this))
        list.appendChild(filterModule.el)
      }
    })

    this.el.appendChild(list)
    this.hideDisabledFilters(filters)
    this.restoreFilterState(state, filters)
  }

  hideDisabledFilters(filters) {
    filters.forEach(filter => {
      const filterModule = this.modules[filter.name];
      (false === filter.enabled) ? filterModule.disable() : filterModule.enable()
    })
  }

  restoreFilterState(state: any, filters: any) {
    filters.forEach((filter) => {
      const filterName = filter.name
      const filterModule = this.modules[filterName]
      const filterState = state[filterName]

      if (filterState) {
        filterModule.setValue(state[filterName])
      }
    })
  }

  updateDatagridStateWithFilters() {
    const filterState: any = {}

    for (let filterName in this.modules) {
      const filter = this.modules[filterName]
      const shortName = `__${filterName}`

      if (filter.enabled) {
          if (!filter.isEmpty()) {
              filterState[filterName] = filter.getValue();
          } else if (!filter.defaultEnabled) {
              filterState[shortName] = 1;
          }
      } else if (filter.defaultEnabled) {
          filterState[shortName] = 0;
      }
    }

    // Update state if changed
    const currentState = _.omit(this.datagridCollection.state.filters, 'scope');
    const updatedState = _.omit(filterState, 'scope')

    if (!_.isEqual(currentState, updatedState)) {
      this.datagridCollection.state.filters = filterState;
      this.datagridCollection.state.currentPage = 1;
      this.datagridCollection.fetch();
    }
  }
}

export = FiltersColumn
