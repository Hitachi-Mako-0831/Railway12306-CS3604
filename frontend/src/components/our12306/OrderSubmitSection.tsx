import React from 'react'

type Props = { onSubmit: () => void; onBack: () => void; isSubmitting: boolean }

const OrderSubmitSection: React.FC<Props> = ({ onSubmit, onBack, isSubmitting }) => {
  return (
    <section style={{ padding: 16 }}>
      <button onClick={onSubmit} disabled={isSubmitting}>提交订单</button>
      <button onClick={onBack} style={{ marginLeft: 8 }}>返回车次列表</button>
    </section>
  )
}

export default OrderSubmitSection