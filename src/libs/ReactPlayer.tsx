import dynamic from 'next/dynamic'

// eslint-disable-next-line import/no-unresolved
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

export default ReactPlayer
