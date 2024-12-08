<script lang="ts">
import Centered from '~/layouts/Centered.vue'

export default {
  name: 'IndexPage',
  components: { Centered },

  data() {
    return {
      schedule: []
    }
  },

  async fetch() {
    await this.$axios.get('/schedule').then(res => {
      this.schedule = res.data.schedule
      console.log(res.data.schedule)
    })
  },

  // async asyncData({ $axios, $config }) {
  //   const schedule = await $axios.$get(`/schedule`)
  //   console.log(schedule)
  //   return { schedule }
  // },

  mounted() {
    window.Echo.channel("schedule-item")
      .listen("CreatedScheduleItem", (e) => {
        this.schedule.push(e.message)
      })
      .listen("UpdatedScheduleItem", (e) => {
        const updatedItem = e.message
        const oldItemIndex = this.schedule.findIndex(item => item.id === updatedItem.id)

        if (oldItemIndex !== -1) {
          this.schedule[oldItemIndex] = updatedItem
        }
      })
      .listen("DeletedScheduleItem", (e) => {
        const deletedItem = e.message
        const deletingItemIndex = this.schedule.findIndex(item => item.id === deletedItem.id)

        if (deletingItemIndex !== -1) {
          this.schedule.splice(deletingItemIndex, 1)
        }
      })
  },
}
</script>

<template>
  <Centered>
    <table
      class="border w-full text-custom font-semibold uppercase leading-[28pt]"
    >
      <thead>
        <tr>
          <td class="bg-primary" colspan="4">
            <div
              class="flex flex-row justify-center items-center w-full py-3 text-white text-[28pt]"
            >
              РАСПИСАНИЕ РАБОТЫ ВРАЧЕЙ
            </div>
          </td>
        </tr>
        <tr>
          <th
            class="bg-[#b4c6e7] border-t border-secondary w-[352px] text-[28pt] py-2"
            colspan="2"
          >
            Специалист
          </th>
          <!--                    <th class="bg-primary border-t border-secondary w-[397px]"></th>-->
          <th
            class="bg-[#9dc3e6] border-t border-secondary w-[175px] text-[28pt]"
          >
            Кабинет
          </th>
          <th
            class="bg-[#9dc3e6] border-t border-secondary w-[340px] text-[28pt]"
          >
            Время приёма
          </th>
        </tr>
      </thead>
      <tbody class="">
        <tr v-for="scheduleItem in schedule" :key="scheduleItem.id" height="62">
          <td class="max-w-[352px] text-[32px] leading-[36px] pl-4 py-1">
            {{ scheduleItem.doctor_job }}
          </td>
          <td class="max-w-[397px] text-[32px] leading-[36px] pl-4">
            ({{ scheduleItem.doctor_fio }})
          </td>
          <td align="center" class="text-[32px] leading-[36px]">
            [{{ scheduleItem.room }}]
          </td>
          <td align="center" class="text-[32px] leading-[36px]">
            <div v-if="scheduleItem.status_schedule_item_id === 1">
              {{ $dateFns.format(scheduleItem.start_at, 'HH:mm') }}-{{
                $dateFns.format(scheduleItem.end_at, 'HH:mm')
              }}
            </div>
            <div v-else>{{ scheduleItem.statusScheduleItem.text }}</div>
          </td>
        </tr>
        <tr
          class="!bg-transparent text-[32px] text-center normal-case"
          height="66"
        >
          <td colspan="4">
            Полный список мед. работников на сайте www.aokb28.su
          </td>
        </tr>
      </tbody>
    </table>
  </Centered>
</template>
