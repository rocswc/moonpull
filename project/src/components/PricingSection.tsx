import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PricingSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate();
  const plans = [
    {
      name: "무료",
      description: "BASIC",
      price: "무료",
      period: "",
      features: [
        "하루에 2번 제 질문 가능",
        "AI 문제 풀이와 여러 문제 질착 가능을 하루에 2번만 이용할 수 있어요",
        "세 질문 당 2번 추가 질문 가능",
        "AI 문제 풀이에서 추가 질문은 세 질문 당 2번만 이용할 수 있어요"
      ],
      buttonText: "무료 체험",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "월간 플러스",
      description: "PLUS",
      price: "₩12,500",
      period: "/ 월간",
      features: [
        "무제한 질문과 답변",
        "AI 문제 풀이와 여러 문제 질착 가능을 제한없이 이용할 수 있어요",
        "다양 확장된 답변",
        "더 독특한 AI 문제 풀이를 이용할 수 있어요",
        "모든 광고 제거",
        "광고에 방해되는 요소 없이 집중할 수 있어요",
        "1:1 멘토님 선생님 질문",
        "선생님에게 질문할 수 있는 10,000코인을 드려요",
        "무제한 무료 노트 필기 검화",
        "자유롭게 필기 및 공재 틀이 적혀을 무료로 사용할 수 있어요!"
      ],
      buttonText: "프리미엄 시작하기",
      buttonVariant: "hero" as const,
      popular: false
    },
    {
      name: "연간 프리미엄",
      description: "PREMIUM",
      price: "₩130,000",
      period: "/ 연간",
      originalPrice: "₩150,000",
      discount: "₩20,000 할인",
      features: [
        "무제한 질문과 답변",
        "AI 문제 풀이와 여러 문제 질착 가능을 제한없이 이용할 수 있어요",
        "다양 확장된 답변",
        "더 독특한 AI 문제 풀이를 이용할 수 있어요",
        "모든 광고 제거",
        "광고에 방해되는 요소 없이 집중할 수 있어요",
        "1:1 멘토님 선생님 질문",
        "선생님에게 질문할 수 있는 10,000코인을 드려요",
        "무제한 무료 노트 필기 검화",
        "자유롭게 필기 및 공재 틀이 적혀을 무료롬 사용할 수 있어요"
      ],
      buttonText: "연간 프리미엄 시작하기",
      buttonVariant: "hero" as const,
      popular: false
    }
  ];

  const handleButtonClick = (plan) => {
    if (plan.name === "무료") {
      alert("안녕");
    } else {
      const amount = plan.name === "월간 플러스" ? 12500 : 130000;
      navigate("/payment/checkout", { state: { amount, planName: plan.description } });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            QANDA Premium으로 업그레이드 해보세요
          </div>
          <p className="text-muted-foreground text-base sm:text-lg">
            더 많은 질문과 답변을 얻고 싶다면 프리미엄을 사용해 보세요.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {plans.map((plan, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`relative flex flex-col justify-between h-full p-6 rounded-3xl transition-all duration-300 hover:shadow-xl ${
                plan.popular || hoveredIndex === index
                  ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-2xl transform hover:scale-105'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                    프리미엄
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Header */}
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium opacity-80">{plan.description}</div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.originalPrice && (
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-base line-through opacity-60">{plan.originalPrice}</span>
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-md text-xs font-bold">
                        {plan.discount}
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm opacity-75">{plan.period}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 text-sm leading-relaxed">
                  {plan.features.map((feature, i) => {
                    const isTitle = i % 2 === 0;
                    return (
                      <div key={i} className={isTitle ? "space-y-1" : ""}>
                        {isTitle ? (
                          <div className="flex items-center space-x-2 font-semibold">
                            <span className={`inline-block w-6 h-6 flex items-center justify-center text-sm rounded-full ${
                              plan.popular || hoveredIndex === index ? 'bg-white/20' : 'bg-orange-100 dark:bg-orange-900'
                            }`}>
                              {i === 0 && "🔄"}
                              {i === 2 && "❓"}
                              {i === 4 && "🚫"}
                              {i === 6 && "👨‍🏫"}
                              {i === 8 && "📝"}
                            </span>
                            <span>{feature}</span>
                          </div>
                        ) : (
                          <p className={`ml-8 ${plan.popular || hoveredIndex === index ? 'text-white/90' : 'text-muted-foreground'}`}>
                            {feature}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Button */}
              <div className="mt-8">
                <Button
                  onClick={() => handleButtonClick(plan)}
                  variant="hero"
                  className={`w-full py-3 text-base rounded-xl font-semibold ${
                    plan.popular || hoveredIndex === index
                      ? 'bg-white text-orange-500 hover:bg-gray-100'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            질의 여러 문제 질착 / 등등상 풀이 / 1:1 선생님 질문은 량다 앱에서 사용할 수 있어요.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;