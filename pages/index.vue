<script lang="ts">
import { Context } from '@nuxt/types'
import { Navigation, Pagination } from 'swiper'
import { Scrollbar, Autoplay } from 'swiper/core'
import { SwiperCore, Swiper, SwiperSlide } from 'swiper-vue2'
import { useNow } from '@vueuse/core'
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
    }
  },

  computed: {
    getNowDate: function () {
      return this.$dateFns.format(useNow().value, 'dd MMMM yyyy HH:mm:ss', { locale: ruLocale })
    },
  },

  mounted() {
    (window as any).Echo.channel('schedule-item')
      .listen('CreatedScheduleItem', (e: any) => {
        this.schedule.push(e.message)
      })
      .listen('UpdatedScheduleItem', (e: any) => {
        const updatedItem = e.message
        const oldItemIndex = this.schedule.findIndex(
          (item: any) => item.id === updatedItem.id
        )

        if (oldItemIndex !== -1) {
          this.schedule[oldItemIndex] = updatedItem
        }
      })
      .listen('DeletedScheduleItem', (e: any) => {
        const deletedItem = e.message
        const deletingItemIndex = this.schedule.findIndex(
          (item) => item.id === deletedItem.id
        )

        if (deletingItemIndex !== -1) {
          this.schedule.splice(deletingItemIndex, 1)
        }
      })
  },
}
</script>

<template>
  <div class="h-screen max-h-screen flex flex-col gap-y-6 p-6">
    <div class="flex flex-row justify-between items-center w-full px-2">
      <img src="/logo.svg" class="w-[280px]" />
      <div class="flex flex-col">
        <h1 class="uppercase font-bold text-center text-3xl">
          Расписание работы врачей
        </h1>
        <div class="font-bold text-2xl text-secondary text-end">
          {{ getNowDate }}
        </div>
      </div>
    </div>
    <div>
      <Swiper
        :direction="'vertical'"
        :slides-per-view="'auto'"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
      >
        <SwiperSlide v-for="(groupSchedule, index) in schedule" :key="index">
          <div class="grid grid-cols-2 gap-4 text-[16px]">
            <div
              v-for="scheduleItem in groupSchedule"
              :key="scheduleItem.id"
              class="flex flex-row items-center border rounded-lg bg-white shadow p-4"
            >
              <div
                class="relative bg-primary rounded-full h-[48px] w-[48px] shrink-0"
              >
                <div class="flex items-center justify-center absolute inset-0">
                  <div class="font-bold pt-0.5">
                    {{ scheduleItem.room }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col w-full pl-6">
                <div class="flex flex-row justify-between items-center">
                  <div class="font-bold uppercase">
                    {{ scheduleItem.doctor_job }}
                  </div>
                  <div
                    v-if="scheduleItem.status_schedule_item_id === 1"
                    class="font-bold text-green-500"
                  >
                    {{ $dateFns.format(scheduleItem.start_at, 'HH:mm') }}-{{
                      $dateFns.format(scheduleItem.end_at, 'HH:mm')
                    }}
                  </div>
                  <div v-else class="font-bold text-red-500 uppercase">
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
