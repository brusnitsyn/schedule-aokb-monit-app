<script lang="ts">
import { Context } from '@nuxt/types'
import Centered from '~/layouts/Centered.vue'

export default {
  name: 'IndexPage',
  components: { Centered },

  // async fetch() {
  //   await this.$axios.get('/schedule').then(res => {
  //     this.schedule = res.data.schedule
  //   })
  // },

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
  <Centered>
    <table
      class="table-fixed border text-custom font-semibold uppercase leading-[28pt]"
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
            class="bg-[#b4c6e7] border-t border-secondary text-[28pt] py-2"
            colspan="2"
          >
            Специалист
          </th>
          <th
            class="bg-[#9dc3e6] border-t border-secondary text-[28pt]"
          >
            Кабинет
          </th>
          <th
            class="bg-[#9dc3e6] border-t border-secondary text-[28pt]"
          >
            Время приёма
          </th>
        </tr>
      </thead>
      <tbody class="w-[1120px]">
        <tr v-for="scheduleItem in schedule" :key="scheduleItem.id" height="62">
          <td class="text-[28px] leading-[32px] pl-4 py-1">
            {{ scheduleItem.doctor_job }}
          </td>
          <td class="text-[28px] leading-[32px] pl-4 text-end">
            ({{ scheduleItem.doctor_fio }})
          </td>
          <td align="center" class="text-[28px] leading-[32px]">
            [{{ scheduleItem.room }}]
          </td>
          <td align="center" class="text-[28px] leading-[32px]">
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

<style scoped>
::v-deep(tr:nth-child(odd)) {
  background-color: #5b9bd5;
}
::v-deep(tr:nth-child(even)) {
  background-color: #fff;
}
</style>
