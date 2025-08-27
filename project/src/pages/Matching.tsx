import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useTranslation } from "@/hooks/useTranslation";

const Matching = () => {
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  const { t } = useTranslation(language);

  const subjects = [
    {
      id: "korean-history",
      name: t("subjectHistory", "matching"),
      description: t("historyDescription", "matching"),
      icon: "📚",
      color: "from-primary to-primary-glow",
      onlineTeachers: 12
    },
    {
      id: "korean",
      name: t("subjectKorean", "matching"),
      description: t("koreanDescription", "matching"),
      icon: "✏️",
      color: "from-pink-500 to-rose-500",
      onlineTeachers: 8
    },
    {
      id: "english",
      name: t("subjectEnglish", "matching"),
      description: t("englishDescription", "matching"),
      icon: "🌍",
      color: "from-blue-500 to-cyan-500",
      onlineTeachers: 15
    }
  ];

    const handleSubjectSelect = (subjectId: string) => {
    navigate(`/matching/${subjectId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("title", "matching")}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            {t("subtitle1", "matching")}
          </p>
          <p className="text-muted-foreground">
            {t("subtitle2", "matching")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className="flex flex-col justify-between group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <CardHeader className="text-center pb-4">
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${subject.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {subject.icon}
                </div>
                <CardTitle className="text-2xl font-bold">
                  {subject.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {subject.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center mt-auto pt-0">
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {t("onlineMentors", "matching")} {subject.onlineTeachers}명
                  </span>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubjectSelect(subject.id);
                  }}
                >
                  {t("findMentor", "matching")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-muted/50 rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-4">💡 {t("matchingMethod", "matching")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl mb-2">1️⃣</div>
                <p>{t("step1", "matching")}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">2️⃣</div>
                <p>{t("step2", "matching")}</p>
              </div>
              <div>
                <div className="text-2xl mb-2">3️⃣</div>
                <p>{t("step3", "matching")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matching;
