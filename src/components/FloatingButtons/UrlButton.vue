<!-- <template>
  <div @mouseover="hovered = true" @mouseleave="hovered = false">
    <v-tooltip left v-if="hovered">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="hovered"
          fab
          dark
          small
          color="green"
          @click="getLink"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
      </template>
      <span>Share timetable as a url</span>
    </v-tooltip>
    <v-btn v-else fab dark small color="green">
      <v-icon>mdi-share-variant</v-icon>
    </v-btn>
  </div>
</template> -->

<template>
  <div>
    <Button
      @click="getLink()"
      icon="pi pi-share-alt"
      rounded
      v-tooltip.bottom="tooltip('Share timetable')"
    />
  </div>
</template>


<script>
/* eslint-disable no-console */
import { mapGetters, mapMutations } from 'vuex';
import { useResponsiveTooltip } from '../../composables/useResponsiveTooltip';

export default {
  setup() {
    const { tooltip } = useResponsiveTooltip();
    return {
      tooltip
    };
  },
  data() {
    return {
      hovered: true,
      exportURL: null,
    };
  },
  computed: {
    ...mapGetters(['getSerializedState']),
  },
  methods: {
    ...mapMutations(['setShareLinkPopup', 'setShareLink']),
    async getLink(){
      const formData = new FormData();
      formData.append('content', this.getSerializedState);
      const res = await fetch('https://api.mclo.gs/1/log',{
        method: 'POST',
        body: formData
      }).then(response => response.json())
      this.setShareLink(res.id)
      this.setShareLinkPopup(true)
    }

  },
};
</script>
