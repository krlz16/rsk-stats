<template>
  <div class="nodes-table">
    <div class="search">
      <button>
        <icon name="search"></icon>
      </button>
      <input
        name="search"
        type="search"
        v-model="filterRows"
        @mousedown.stop=""
        @touchstart.stop=""
        id="search"
        placeholder="type to filter"
      />

      <div class="hidden-fields" v-if="hiddenFields.length">
        <small>Hidden fields:</small>
        <button
          v-for="(field, i) in hiddenFields"
          @click="showField(field)"
          @touchstart.passive="showField(field)"
          :key="i"
        >
          <entity-icon :entity="entity[field]"></entity-icon>
        </button>
      </div>
    </div>

    <table class="nodes dark" v-if="fields">
      <thead>
        <tr class="field-actions">
          <!-- fields -->
          <th
            v-for="(field, key) in fields"
            @touchstart.passive="hideField(field)"
            :key="key"
          >
            <button @click="hideField(field)" v-if="!isHidden(field)">
              <icon name="close"></icon>
            </button>
          </th>
          <th></th>
        </tr>
        <tr>
          <!-- fields -->
          <th
            v-for="(field, i) in fields"
            :key="i"
          >
            <button v-if="!isHidden(field)" @click="sortBy(field)" @touchstart.passive="sortBy(field)">
              <entity-icon :entity="entity[field]">
                <div class="order" v-if="field === sortKey" slot="badge">
                  <span class="arrow up" v-if="sortOrders[field] > 0"></span>
                  <span class="arrow down" v-else></span>
                </div>
              </entity-icon>
            </button>
          </th>
          <th>
            <icon name="pin"></icon>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- no content -->
        <tr class="full" v-if="rows.length === 0">
          <td :colspan="fields.length + 2">There are no results that match your search</td>
        </tr>

        <!-- rows -->
        <tr
          v-for="(node, index) in rows"
          :class="rowClass(index, node.id)"
          :key="index"
        >
          <!-- fields -->
          <td
            v-for="(field, i) in fields"
            :class="toKebab(field)"
            :key="i"
          >
            <template v-if="!isHidden(field)">
              <node-chart
              v-if="field === 'nodeHistory'"
              :data="nodeChart(node.id)"
              name="nodeChart2"
              ></node-chart>
              <entity-value
              v-else
              :value="node[field]"
              :entity="entity[field]"
              :fields="node"
              ></entity-value>
            </template>
          </td>
          <!-- Pin button -->
          <td>
            <div class="pin" @click="pinRow(node.id)" @touchstart.passive="pinRow(node.id)">
              <icon v-if="isPinned(node.id)" name="pinned" color2></icon>
              <icon v-else name="pin"></icon>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="loading" v-else>
      <h2>loading data...</h2>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import NodeChart from './NodeChart.vue'
import EntityMixin from '../mixins/Entity'
export default {
  name: 'nodes-table',
  mixins: [
    EntityMixin
  ],
  components: {
    NodeChart
  },
  created () {
    this.initTable()
  },
  computed: {
    ...mapGetters('app/entity/', {
      nodes: 'getNodesEntitiesArr'
    }),
    ...mapGetters('app/nodesTable', [
      'fields',
      'hiddenFields',
      'rows',
      'sortKey',
      'sortOrders'
    ]),
    filterRows: {
      get () {
        return this.$store.state.app.nodesTable.filterKey
      },
      set (value) {
        this.updateFilterKey(value)
      }
    }
  },
  methods: {
    ...mapGetters(['getNode']),
    ...mapGetters('app/nodesTable', [
      'isPinned',
      'isHiddenField'
    ]
    ),
    ...mapActions('app/nodesTable', [
      'initTable',
      'sortBy',
      'showField',
      'hideField',
      'pinRow',
      'updateFilterKey'
    ]),
    isHidden (field) {
      let h = this.isHiddenField()(field)
      return (h > -1)
    },
    nodeChart (id) {
      return this.getNode()(id).history
    },
    rowClass (index, id) {
      // let node = this.getNode()(id)
      let data = this.rows[index]
      let cssClass = (index % 2) ? 'odd' : 'even'
      if (data && !data.active) cssClass += ' inactive'
      if (this.isPinned()(id)) cssClass += ' pinned'
      return cssClass
    },
    toKebab (value) {
      return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }
  }
}
</script>
<style lang="stylus">

  .nodes-table
    overflow visible
    flex-direction column

  table.nodes
    min-width 100%

    thead
      tr
        min-width 100%

    tbody
      overflow-y auto
      overflow-x visible

    tr.full
      min-width 100%

    td, th
      will-change trasform
      animation-name row-anim
      animation-duration 0.5s
      animation-timing-function ease-out

    @keyframes row-anim
      0%
        transform rotateX(-90deg)

      40%
        rotateZ(10deg)

      50%
        transform rotateX(45deg) rotateZ(0)

      100%
        transform rotateX(0)

    .node-history, .node-chart
      height 50px
      padding 0
      max-width 10em
      min-width 5em
      max-height 2em
      margin 0

      svg
        path
          stroke-width 1px

  .search
    display flex

    input
      margin-right 0.5em

  .hidden-fields
    z-index 500
    display flex
    flex 1
    order 2

    button
      margin-left 0.5em

  tr.field-actions
    padding 0
    line-height 1em

    td, th
      background none
      margin 0
      padding 0

      .svg-icon, button
        width 0.8em
        height @width
</style>
