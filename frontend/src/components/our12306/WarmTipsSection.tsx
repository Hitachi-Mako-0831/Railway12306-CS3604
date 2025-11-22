import React from 'react'

type Props = { onTermsClick: () => void }

const WarmTipsSection: React.FC<Props> = ({ onTermsClick }) => {
  return (
    <section style={{ padding: 16 }}>
      <h4>温馨提示</h4>
      <p>购买车票请遵守实名制要求，核对信息无误后提交。</p>
      <button onClick={onTermsClick}>查看条款</button>
    </section>
  )
}

export default WarmTipsSection