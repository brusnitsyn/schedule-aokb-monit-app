<script lang="ts">
import { Context } from '@nuxt/types'
import { Navigation, Pagination } from 'swiper'
import { Scrollbar, Autoplay } from 'swiper/core'
import { SwiperCore, Swiper, SwiperSlide } from 'swiper-vue2'
import { useEventSource, useNow } from '@vueuse/core'
import ruLocale from 'date-fns/locale/ru'
import 'swiper/swiper-bundle.css'
SwiperCore.use([Navigation, Pagination, Scrollbar, Autoplay])

export default {
  name: 'IndexPage',
  components: {
    Swiper,
    SwiperSlide,
  },

  async asyncData({ $axios }: Context) {
    let schedule
    await $axios.get('/schedule').then((res) => {
      schedule = res.data.schedule
    })

    return { schedule }
  },

  data() {
    return {
      schedule: [],
      eventSource: null,
    }
  },

  computed: {
    getNowDate: function () {
      if (this.eventSource !== null && this.eventSource.data !== null) {
        const data = JSON.parse(this.eventSource.data)
        return this.$dateFns.format(new Date(data.time), 'dd MMMM yyyy HH:mm:ss', { locale: ruLocale })
      }
      return this.$dateFns.format(useNow().value, 'dd MMMM yyyy HH:mm:ss', { locale: ruLocale })
    },
  },

  beforeDestroy() {
      if (this.eventSource) {
        this.eventSource.close()
      }
  },

  mounted() {
    (window as any).Echo.channel('schedule-item')
      .listen('CreatedScheduleItem', (e: any) => {
        this.schedule[this.schedule.length].push(e.message)
      })
      .listen('UpdatedScheduleItem', (e: any) => {
        const updatedItem = e.message

        for (let i = 0; i < this.schedule.length; i++) {
          const oldIndex = this.schedule[i].findIndex((item) => item.id === updatedItem.id)

          if (oldIndex !== -1) {
            this.schedule[i][oldIndex] = updatedItem
            return
          }
        }
      })
      .listen('DeletedScheduleItem', (e: any) => {
        const deletedItem = e.message

        for (let i = 0; i < this.schedule.length; i++) {
          const deletingItemIndex = this.schedule[i].findIndex(
            (item) => item.id === deletedItem.id
          )

          if (deletingItemIndex !== -1) {
            this.schedule[i].splice(deletingItemIndex, 1)
            return
          }
        }
      })

    this.getServerTime()
  },

  methods: {
    getServerTime() {
      this.eventSource = useEventSource(`http://${this.$config.reverbHost}:3031/sse/time`)
    }
  },
}
</script>

<template>
  <div class="h-screen max-h-screen flex flex-col p-6">
    <div class="flex flex-row justify-between items-center w-full px-2">
      <img src="/logo.svg" class="w-[280px]" />
      <div class="flex flex-col">
        <h1 class="uppercase font-semibold text-center text-3xl">
          Расписание работы врачей
        </h1>
        <div class="font-semibold text-2xl text-secondary text-end">
          {{ getNowDate }}
        </div>
      </div>
    </div>
    <div class="mt-6">
      <Swiper
        :direction="'vertical'"
        :slides-per-view="'auto'"
        :space-between="16"
        :speed="0"
        :autoplay="{ delay: 10000, disableOnInteraction: false }"
      >
        <SwiperSlide v-for="(groupSchedule, index) in schedule" :key="index">
          <div class="grid grid-cols-2 gap-4 text-[16px]">
            <div
              v-for="scheduleItem in groupSchedule"
              :key="scheduleItem.id"
              class="flex flex-row items-center border rounded-lg bg-white shadow p-4"
            >
              <div
                class="relative bg-primary rounded-full h-[48px] w-[48px] shrink-0 bg-opacity-[0.16]"
              >
                <div class="flex items-center justify-center absolute inset-0">
                  <div class="font-semibold pt-0.5 text-primary">
                    {{ scheduleItem.room }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col w-full pl-4">
                <div class="flex flex-row justify-between items-center">
                  <div class="font-semibold uppercase">
                    {{ scheduleItem.doctor_job }}
                  </div>
                  <div
                    v-if="scheduleItem.status_schedule_item_id === 1"
                    class="font-semibold text-green-500"
                  >
                    {{ $dateFns.format(scheduleItem.start_at, 'HH:mm') }}-{{
                      $dateFns.format(scheduleItem.end_at, 'HH:mm')
                    }}
                  </div>
                  <div v-else class="font-semibold text-red-500 uppercase">
                    {{ scheduleItem.statusScheduleItem.text }}
                  </div>
                </div>
                <div class="capitalize text-secondary">
                  {{ scheduleItem.doctor_name }}
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </div>
</template>

<style scoped>
::v-deep(.swiper-container) {
  @apply h-[calc(100vh-124px)] p-2;
}
::v-deep(tr:nth-child(odd)) {
  background-color: #5b9bd5;
}
::v-deep(tr:nth-child(even)) {
  background-color: #fff;
}
</style>
