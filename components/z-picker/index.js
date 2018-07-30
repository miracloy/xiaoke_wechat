Component({
  properties: {
    name: String,
    list: Array,
    value: String,
    placeholder: String
  },
  data: {
    index: '', isUnfold: false
  },
  methods: {
    _unfold () {
      !this.data.isUnfold ? this.setData({ isUnfold: true }) : this.setData({ isUnfold: false })
    },
    _selete (e) {
      var index = e.currentTarget.dataset.index
      let detail = { index }
      this.triggerEvent('changeValue', detail)
      this.setData({ index, isUnfold: false, value: index })
    }
  }
})