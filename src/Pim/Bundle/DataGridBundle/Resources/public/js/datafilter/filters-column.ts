import BaseView = require('pimenrich/js/view/base')
import * as _ from 'underscore'

const mediator = require('oro/mediator')

interface FiltersConfig {
  title: string
  description: string
}

interface Filter {
    group: string
    label: string
}

// @TODO only load when you expand the column
// @TODO only initialize filters when you click on them

class FiltersColumn extends BaseView {
  public timer: any = null
  public defaultFilters: Filter[]
  public loadedFilters: Filter[]
  public page: number = 1

  readonly config: FiltersConfig
  readonly template: string = `
    <button type="button" class="AknFilterBox-addFilterButton" aria-haspopup="true" style="width: 280px">
        <div>Filters</div>
    </button>
    <div class="filter-selector">
        Enabled filters
    <div>
    <div
        class="ui-multiselect-menu ui-widget ui-widget-content ui-corner-all AknFilterBox-addFilterButton filter-list select-filter-widget pimmultiselect"
        style="width: 230px;display: block;top: -191px;left: 360px;position:fixed;overflow: scroll"
    >
        <div class="ui-multiselect-filter"><input placeholder="" type="search"></div>
        <div class="filters-column"></div>
    </div>
  `

  readonly filterListTemplate: string = `
    <ul class="ui-multiselect-checkboxes ui-helper-reset">
        <li class="ui-multiselect-optgroup-label">
            <a href="#"><%- groupName %></a>
        </li>
        <% filters.forEach(filter => { %>
        <li>
            <label for="<%- filter.name %>" title="" class="ui-corner-all ui-state-hover">
                <input id="<%- filter.name %>" name="multiselect_add-filter-select" type="checkbox" value="<%- filter.name %>" title="<%- filter.label %>" <%- filter.enabled ? 'checked="checked"' : ''  %> aria-selected="true">
                    <span><%- filter.label %></span>
            </label>
        </li>
        <% }) %>
    </ul>`

  constructor(options: {config: FiltersConfig}) {
    super(options)

    this.config = {...this.config, ...options.config}
  }

  public events(): Backbone.EventsHash {
    return {
      'keyup input[type="search"]': 'searchFilters',
      'scroll .filter-list': 'fetchNextFilters'
    }
  }

  fetchFilters(search?: string | null, page: number = this.page) {
      const url = 'datagrid/product-grid/attributes-filters'
      return $.get(search ? `${url}?search=${search}` : `${url}?page=${page}`)
  }

  fetchNextFilters(event: JQueryMouseEventObject) {
      const list: any = event.currentTarget
      const scrollPosition = Math.max(0, list.scrollTop - 15)
      const bottomPosition = (list.scrollHeight - list.offsetHeight)
      const isBottom = bottomPosition === scrollPosition

      if (isBottom) {
        this.page = this.page + 1

        this.fetchFilters(null, this.page).then(loadedFilters => {
            if (loadedFilters.length === 0) {
                return this.stopListeningToListScroll()
            }

            this.loadedFilters = [ ...this.loadedFilters, ...loadedFilters ]
            return this.renderFilters()
        })
      }
  }

  searchFilters(event: JQueryEventObject) {
    if (null !== this.timer) {
        clearTimeout(this.timer)
    }

    if (13 === event.keyCode) {
        this.doSearch()
    } else {
        this.timer = setTimeout(this.doSearch.bind(this), 200)
    }
  }

  doSearch() {
      const searchValue: any = this.$('input[type="search"]').val()

      if (searchValue.length === 0) {
          return this.renderFilters()
      }

      this.fetchFilters(searchValue, 1).then((loadedFilters: Filter[]) => {
        const filters: Filter[] = this.defaultFilters.concat(loadedFilters)

        return this.renderFilters(filters.filter((filter: Filter) => {
            const label: string = filter.label.toLowerCase()

            return label.includes(searchValue.toLowerCase())
        }))
      })
  }

  listenToListScroll(): void {
    this.$('.filter-list').off('scroll').on('scroll', this.fetchNextFilters.bind(this))
  }

  stopListeningToListScroll(): void {
    this.$('.filter-list').off('scroll')
  }

  renderFilters(filters = this.loadedFilters) {
    const groupedFilters: any = this.groupFilters(filters)
    const list = document.createDocumentFragment();

    this.$('.filters-column').empty()
    this.el.appendChild(list);

    for (let groupName in groupedFilters) {
        const group: Filter[] = groupedFilters[groupName]
        const groupElement = this.renderFilterGroup(group, groupName)
        list.appendChild($(groupElement).get(0));
    }

    this.$('.filters-column').append(list)
  }

  loadFilterList(gridCollection: any, gridElement: any) {
    console.log(gridCollection)
    const metadata = gridElement.data('metadata') || {}

    this.defaultFilters = metadata.filters
    this.fetchFilters().then((loadedFilters: Filter[]) => {
        this.loadedFilters = [ ...this.defaultFilters, ...loadedFilters ]
        this.renderFilters()
        this.listenToListScroll()
    })
  }

  renderFilterGroup(filters: Filter[], groupName: string) {
      return _.template(this.filterListTemplate)({ filters, groupName})
  }

  groupFilters(filters: Filter[]) {
      return _.groupBy(filters, (filter: Filter) => filter.group || 'System')
  }

  configure() {
    this.listenTo(mediator, 'datagrid_collection_set_after', this.loadFilterList)

    return BaseView.prototype.configure.apply(this, arguments)
  }

  /**
   * {@inheritdoc}
   */
  render(): BaseView {
      this.$el.html(_.template(this.template))

      return this
  }
}

export = FiltersColumn