import Single from '../views/single/index.vue'
import TpSingle from '../views/single/temp_room.vue'
import ReactionVideo from '../views/single/reaction.vue'

export default [{
  path: '/single',
  name: 'single',
  component: Single
},
{
  path: '/private_single',
  name: 'private_single',
  component: TpSingle
},
{
  path: '/reaction',
  name: 'reaction',
  component: ReactionVideo,
  props: true
}
]
