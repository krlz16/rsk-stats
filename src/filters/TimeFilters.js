import Vue from 'vue'
import * as moment from 'moment'

export const tSecondsAgo = Vue.filter('t-seconds-ago', (timestamp) => {
  let time = moment(timestamp).format('s')
  return sAgo(time)
})

export const mSecondsAgo = Vue.filter('m-seconds-ago', (miliseconds) => {
  let seconds = mToSeconds(miliseconds)
  return sAgo(seconds)
})

export const mToSeconds = Vue.filter('m-to-seconds', (miliseconds) => {
  let seconds = Math.floor(miliseconds / 1000)
  seconds = (seconds >= 0) ? seconds : 0
  return seconds
})

const sAgo = (time) => {
  if (time > 60) {
    time = moment.duration(time, 'seconds').humanize()
  } else {
    time += 's'
  }
  return time
}

export const abbreviatedTimeObj = (time) => {
  let suffix = 'ms'
  if (time <= 0) return { time: 0, suffix }
  if (time < 1000) return { time, suffix }
  time = Math.floor(parseInt(time) / 1000)
  if (time < 1) return { time, suffix }
  let ts = {
    s: 60,
    m: 60 * 60 * 1.25,
    h: 60 * 60 * 24,
    d: 60 * 60 * 24 * 30,
    M: 60 * 60 * 24 * 30 * 300
  }
  suffix = 's'
  if (time < 60) return { time, suffix }
  for (let t in ts) {
    let seconds = ts[t]
    if (time < seconds) {
      time = Math.floor(time / seconds)
      return { time, suffix }
    }
    suffix = t
  }
  return { time: 0, suffix: 'ms' }
}

export const abbrTime = Vue.filter('abbr-time', (time) => {
  let obj = abbreviatedTimeObj(time)
  return obj.time + '' + obj.suffix
})

export const abbrTimeSeconds = Vue.filter('abbr-time-seconds', (time) => {
  if (time < 1000) return '0s'
  let obj = abbreviatedTimeObj(time)
  return obj.time + '' + obj.suffix
})

export const sSeconds = Vue.filter('s-seconds', (time) => {
  if (time < 60) return parseFloat(time).toFixed(2) + ' s'
  return moment.duration(Math.round(time), 's').humanize()
})

export const dateFromTs = Vue.filter('date-from-ts', (timestamp) => {
  timestamp = Number(timestamp)
  let date = new Date(timestamp)
  let datetime = date.getDate() + '/' +
    (date.getMonth() + 1) + '/' +
    date.getFullYear() + '-' +
    date.getHours() + ':' +
    date.getMinutes() + ':' +
    date.getSeconds()
  return datetime
})

export const miliseconds = Vue.filter('miliseconds', (time) => {
  time = parseInt(time)
  if (time === 0) return time
  if (time < 1000) return time + ' ms'
  let seconds = Math.floor(time / 1000)
  return sAgo(seconds)
})
