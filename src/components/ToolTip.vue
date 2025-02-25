
<template lang="pug">
  .tooltip(@mouseleave.passive='show=false' @mouseenter.passive='show=true' @touchend.passive='touch')
    .trim(v-if='trim') {{trimed[0]}}
    slot(v-else)
    .points(v-if='trim' :class='pointsClass')
        button(v-if='!show')
          span.icon {{ opts.trimTxt }}
        button(v-if='show  && opts.copy' @click='copyText' @touchend.stop='copyText')
          icon(name='copy')
    .trim(v-if='trimed[1]') {{trimed[1]}}
    //- Tooltip
    .tip(v-if='show' :class='opts.pos' :style='tipPos')
      //- value
      .value(:class=' (clicked) ? "clicked" : ""' )
        .msg(v-if='show && opts.copyMsg' :class='(anim) ? "anim" : ""') copied!
        .copy-txt(@touchend.stop='show = !show' @click.stop='show = !show')
          .tip-txt(:class='tipClass') {{value}}
          textarea(ref='cptxt' rows='1' :cols='value.length') {{ value }}
</template>
<script>
/**
 *   - value: text to trim
  - trim: trim position, 0  to not trim
  - options:
    - pos: [top | bottom | left | right], tooltip position
    - copy: [boolean], show copy button
    - trimAt: 'start' | 'end' | 'center'
    - copyMsg: [boolean], show message when copy
    - trimTxt: '...' [string], symbol to replace trimmed text
 */
import '../icons/copy'
export default {
  name: 'tool-tip',
  props: [
    'value',
    'trim',
    'options'
  ],
  data () {
    return {
      show: false,
      clicked: false,
      anim: false,
      closer: null,
      opts: {
        pos: 'top',
        trimAt: 'start',
        copy: true,
        copyMsg: true,
        trimTxt: '...'
      }
    }
  },
  created () {
    if (this.options) {
      for (let op in this.options) {
        this.$set(this.opts, op, this.options[op])
      }
    }
  },
  computed: {
    trimed () {
      let trimed = [this.value]
      let value = this.value
      let trimAt = this.opts.trimAt
      let len = this.value.length
      if (this.trim) {
        switch (trimAt) {
          case 'end':
            trimed = [value.substring(len - this.trim, len)]
            break
          case 'center':
            trimed = [value.slice(0, this.trim), value.slice(-this.trim)]
            break
          default:
            trimed = [value.substring(0, this.trim)]
            break
        }
      }
      return trimed
    },
    tipPos () {
      let pos = this.opts.pos
      if (pos === 'bottom' || pos === 'top') {
        let p = (pos === 'top') ? 'bottom' : 'top'
        return p + ':' + this.$el.clientHeight + 'px; left:0'
      }
      if (pos === 'left' || pos === 'right') {
        let p = (pos === 'left') ? 'right' : 'left'
        return p + ':' + this.$el.clientWidth + 'px;  bottom: -50%;'
      }
      return undefined
    },
    tipClass () {
      let css = []
      if (this.anim) css.push('copying')
      if (this.value.length < 30) css.push('nowrap')
      return css
    },
    pointsClass () {
      let css = []
      let trimAt = this.opts.trimAt
      let pos = 'right'
      if (this.clicked) css.push('clicked')
      if (trimAt !== 'start') pos = (trimAt === 'end') ? 'left' : 'center'
      css.push(pos)
      return css
    }
  },
  methods: {
    touch (value) {
      if (!value) value = !this.clicked
      this.clicked = value
      this.show = !this.show
      // timeout to close tip after, not for trimmeds
      if (this.show && !this.trim) {
        if (!this.closer) {
          let vm = this
          this.closer = setTimeout(() => {
            vm.show = false
          }, 3000)
        }
      }
    },
    copyText () {
      let text = this.$refs.cptxt
      text.value = this.value
      text.select()
      try {
        document.execCommand('copy')
        this.anim = true
        text.value = ''
        let vm = this
        // restart animation
        setTimeout(() => {
          vm.anim = false
        }, 600)
      } catch (err) {
        // console.info('Unable to copy')
      }
      this.$emit('copy', this.value)
    }
  }
}
</script>
<style lang="stylus">

  $tip-arrow-size = 5px
  $tip-bg = white
  $tip-bc = $color
  $tip-border = 1px

  .tooltip, .trim
    position relative
    display inline-block
    overflow visible

  .nowrap
    white-space nowrap

  // Arrow mixin
  arrow(pos)
    if (pos == 'top' || (pos == 'bottom'))
      v = 'left'
      vv = 50%
    else
      v = 'bottom'
      vv = 50%

    &:after, &:before
      {pos} 100%
      {v} vv

    &:after
      border-{pos}-color #000
      margin-{v} $tip-arrow-size * -1

    &:before
      border-{pos}-color $tip-bc
      margin-{v} -($tip-arrow-size + $tip-border)

  .tooltip
    position relative

    .tip
      position absolute
      filter drop-shadow($box-sh)
      width 100%
      color $dark
      display flex
      justify-content flex-start // arrow on start
      text-transform capitalize
      z-index 200

      .value
        border-radius 3px
        padding 0.125em 0.25em
        background-color #000
        word-break break-all
        display flex
        justify-content center
        align-items center

      .tip-txt
        padding 0.25em
        overflow visible
        display inline
        margin 0
        font-size 0.9rem

    .tip:after, .tip:before
      border solid transparent
      content ' '
      height 0
      width 0
      position absolute
      z-index 100

    .tip:after
      border-width $tip-arrow-size

    .tip:before
      border-width $tip-arrow-size + $tip-border

    // generates tip classes
    for pos in top bottom left right
      .tip.{pos}
        arrow(pos)

    .points
      display inline-block
      box-shadow none
      margin 0 0.25em
      line-height 0.5em
      margin-top 0.25em

      button
        height 1em
        line-height 1em

    .points.left
      float left

    .points.right
      float right

    button.copy
      display block
      position absolute
      left 0
      top 0.25em
      line-height 1em
      font-size 1em
      margin 0 0.5em

      .icon
        font-size 1em

    .copy-txt
      display inline

      textarea
        border none
        margin 0
        padding 0
        background-color inherit
        opacity 0
        width 1px
        heigth 1px

    button.close
      line-height 1em
      height 1em

      &:after
        top 0.25em !important
        right 0.25em !important
        border-radius 50%
        line-height 1em
        height 1em
        width 1em
        padding 0.25em

  .head
    display block

  .msg
    color $color
    position absolute
    top -1.5em
    left 0
    width 100%
    font-size 0.8em
    opacity 0

  // Copy Animations
  .anim
    animation-duration 0.5s
    animation-name copya
    animation-timing-function ease-in-out
    opacity 0

    @keyframes copya
      0%
        opacity 0

      75%
        transform translateY(-1em)

      80%
        opacity 1

      100%
        opacity 0
        transform translateY(-5em)

  .copying
    animation-duration 1s
    animation-name copyb

  @keyframes copyb
    0%
      color $color

    100%
      color inherit
</style>
